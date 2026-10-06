<?php

namespace Tests\Feature\Documents;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Documents\Contracts\ContentScanner;
use App\Domains\Documents\Models\DocumentAttachment;
use App\Domains\Documents\Services\BasicContentScanner;
use App\Domains\Documents\Services\ClamdScanner;
use App\Domains\Documents\Services\ScannerChain;
use App\Domains\Notifications\Models\UserNotification;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Database\Seeders\DocumentTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ClamdScannerTest extends TestCase
{
    use RefreshDatabase;

    /** @var list<resource> */
    private array $peers = [];

    private function tmp(string $bytes): string
    {
        $p = tempnam(sys_get_temp_dir(), 'scan');
        file_put_contents($p, $bytes);
        $this->beforeApplicationDestroyed(fn () => @unlink($p));

        return $p;
    }

    /** A scanner wired to an in-process "clamd": the reply is queued on the peer end, what the scanner sends is captured. */
    private function scannerWithReply(?string $reply, ?array &$peer = null, array $config = []): ClamdScanner
    {
        [$client, $peer0] = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, STREAM_IPPROTO_IP);
        if ($reply !== null) {
            fwrite($peer0, $reply);
        }
        $peer = [$peer0];
        $this->peers[] = $peer0; // keep the server end open for the whole test

        return new ClamdScanner($config + ['timeout' => 1], fn () => $client);
    }

    private function received(array $peer): string
    {
        stream_set_blocking($peer[0], false);

        return (string) stream_get_contents($peer[0]);
    }

    public function test_a_clean_reply_accepts_and_the_instream_protocol_is_spoken_exactly(): void
    {
        $scanner = $this->scannerWithReply("stream: OK\0", $peer, ['chunk_size' => 1024]);
        $bytes = str_repeat('A', 2500);

        $this->assertNull($scanner->reject($this->tmp($bytes), 'application/pdf'));

        $sent = $this->received($peer);
        $this->assertStringStartsWith("zINSTREAM\0", $sent);
        $body = substr($sent, strlen("zINSTREAM\0"));
        $chunks = [];
        for ($o = 0; $o < strlen($body);) {
            $len = unpack('N', substr($body, $o, 4))[1];
            $chunks[] = substr($body, $o + 4, $len);
            $o += 4 + $len;
            if ($len === 0) {
                break;
            }
        }
        $this->assertSame([1024, 1024, 452, 0], array_map('strlen', $chunks), 'chunks then a zero-length terminator');
        $this->assertSame($bytes, implode('', $chunks));
        $this->assertSame(strlen("zINSTREAM\0") + 2500 + 4 * 4, strlen($sent));
    }

    public function test_a_signature_hit_is_rejected_as_malware(): void
    {
        $scanner = $this->scannerWithReply("stream: Eicar-Test-Signature FOUND\0");
        $this->assertSame('malware_detected', $scanner->reject($this->tmp('X5O!P%@AP'), 'application/pdf'));
    }

    public function test_error_replies_garbage_and_silence_fail_closed(): void
    {
        foreach (["INSTREAM size limit exceeded. ERROR\0", "garbage\0", "\0", ''] as $reply) {
            $this->assertSame('scanner_unavailable', $this->scannerWithReply($reply)->reject($this->tmp('data'), 'application/pdf'), json_encode($reply));
        }
        // a daemon that never answers (timeout)
        $this->assertSame('scanner_unavailable', $this->scannerWithReply(null)->reject($this->tmp('data'), 'application/pdf'));
    }

    public function test_unreachable_daemon_fails_closed_by_default_and_open_only_when_configured(): void
    {
        $closedPort = ['host' => '127.0.0.1', 'port' => 1, 'timeout' => 1]; // nothing listens on port 1
        $this->assertSame('scanner_unavailable', (new ClamdScanner($closedPort))->reject($this->tmp('data'), 'application/pdf'));
        $this->assertNull((new ClamdScanner($closedPort + ['fail_closed' => false]))->reject($this->tmp('data'), 'application/pdf'));
        $this->assertSame('scanner_unavailable', (new ClamdScanner(['socket' => '/nonexistent/clamd.sock', 'timeout' => 1]))->reject($this->tmp('data'), 'application/pdf'));
    }

    public function test_a_connector_that_throws_or_a_missing_file_is_unavailable_not_an_exception(): void
    {
        $throws = new ClamdScanner([], function () {
            throw new \RuntimeException('boom with /secret/path');
        });
        $this->assertSame('scanner_unavailable', $throws->reject($this->tmp('x'), 'image/png'));
        $this->assertSame('scanner_unavailable', $this->scannerWithReply("stream: OK\0")->reject('/nonexistent/file', 'image/png'));
    }

    public function test_the_chain_runs_cheap_checks_first_and_stops_at_the_first_rejection(): void
    {
        $calls = [];
        $a = new class($calls) implements ContentScanner
        {
            public function __construct(private array &$calls) {}

            public function reject(string $p, string $m): ?string
            {
                $this->calls[] = 'a';

                return 'pdf_active_content';
            }
        };
        $b = new class($calls) implements ContentScanner
        {
            public function __construct(private array &$calls) {}

            public function reject(string $p, string $m): ?string
            {
                $this->calls[] = 'b';

                return null;
            }
        };
        $this->assertSame('pdf_active_content', (new ScannerChain([$a, $b]))->reject('f', 'm'));
        $this->assertSame(['a'], $calls);
    }

    public function test_basic_scanner_decodes_pdf_name_hex_escapes(): void
    {
        $pdf = "%PDF-1.4\n1 0 obj<</Type/Catalog/Names<</Java#53cript 2 0 R>>/Open#41ction 3 0 R>>endobj\n%%EOF";
        $this->assertSame('pdf_active_content', (new BasicContentScanner)->reject($this->tmp($pdf), 'application/pdf'));
        $this->assertNull((new BasicContentScanner)->reject($this->tmp("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF"), 'application/pdf'));
    }

    // ---- through the real upload endpoint ----------------------------------------------------------------

    private function uploadWith(ContentScanner $scanner)
    {
        Storage::fake('documents');
        $this->seed(DocumentTypeSeeder::class);
        app(AccessSynchronizer::class)->sync();
        $this->app->instance(ContentScanner::class, $scanner);
        $u = User::factory()->create();
        app(ConsentService::class)->record($u, ['document_storage' => true]);
        $this->actingAs($u, 'sanctum');
        $d = $this->postJson('/api/v1/my-documents', ['type' => 'residence_permit', 'label' => 'p', 'expiry_date' => now()->addDays(100)->toDateString()])->json('data');

        return $this->post("/api/v1/my-documents/{$d['id']}/attachments", ['file' => UploadedFile::fake()->createWithContent('a.pdf', "%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF")], ['Accept' => 'application/json']);
    }

    public function test_upload_is_rejected_localized_and_admins_alerted_when_the_scanner_is_down(): void
    {
        $this->seed(DocumentTypeSeeder::class);
        app(AccessSynchronizer::class)->sync();
        $admin = User::factory()->create();
        $admin->syncRoleKeys(['admin']);

        $res = $this->uploadWith(new ClamdScanner(['host' => '127.0.0.1', 'port' => 1, 'timeout' => 1]));

        $res->assertStatus(503)->assertJsonPath('error.code', 'scanner_unavailable');
        $this->assertSame(0, DocumentAttachment::count());
        $this->assertSame(['scanner_unavailable'], UserNotification::where('user_id', $admin->id)->pluck('type')->all());
        $this->assertSame([], Storage::disk('documents')->allFiles());

        // a second failure within the hour does not alert again
        $this->uploadWith(new ClamdScanner(['host' => '127.0.0.1', 'port' => 1, 'timeout' => 1]))->assertStatus(503);
        $this->assertSame(1, UserNotification::where('user_id', $admin->id)->count());
    }

    public function test_infected_upload_is_rejected_with_the_generic_security_error(): void
    {
        $this->uploadWith($this->scannerWithReply("stream: Eicar FOUND\0"))->assertStatus(422)->assertJsonPath('error.code', 'attachment_rejected');
        $this->assertSame(0, DocumentAttachment::count());
    }

    public function test_clean_upload_is_stored(): void
    {
        $this->uploadWith($this->scannerWithReply("stream: OK\0"))->assertCreated();
    }

    public function test_the_clamav_driver_is_bound_as_basic_plus_clamd(): void
    {
        config(['documents.scanner' => 'clamav']);
        $this->assertInstanceOf(ScannerChain::class, $this->app->make(ContentScanner::class));
    }
}

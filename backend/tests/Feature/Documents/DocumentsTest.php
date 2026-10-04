<?php

namespace Tests\Feature\Documents;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Documents\Models\DocumentAttachment;
use App\Domains\Documents\Models\UserDocument;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Database\Seeders\DocumentTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('documents');
        $this->seed(DocumentTypeSeeder::class);
        app(AccessSynchronizer::class)->sync();
    }

    private function user(bool $consent = true): User
    {
        $u = User::factory()->create();
        if ($consent) {
            app(ConsentService::class)->record($u, ['document_storage' => true]);
        }
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function make(array $over = []): array
    {
        return $this->postJson('/api/v1/my-documents', array_merge([
            'type' => 'residence_permit',
            'label' => 'My permit',
            'issue_date' => now()->subYear()->toDateString(),
            'expiry_date' => now()->addDays(200)->toDateString(),
        ], $over))->assertCreated()->json('data');
    }

    private function pdf(string $extra = ''): string
    {
        return "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n$extra\ntrailer<<>>\n%%EOF";
    }

    private function png(): string
    {
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    }

    private function file(string $name, string $bytes): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, $bytes);
    }

    private function upload(int $docId, UploadedFile $file)
    {
        return $this->post("/api/v1/my-documents/$docId/attachments", ['file' => $file], ['Accept' => 'application/json']);
    }

    // ---- types & CRUD -------------------------------------------------------------------------

    public function test_document_types_are_public_and_localized(): void
    {
        $ar = collect($this->getJson('/api/v1/document-types', ['Accept-Language' => 'ar'])->assertOk()->json('data'));
        $this->assertCount(12, $ar);
        $this->assertStringContainsString('Permesso di soggiorno', $ar->firstWhere('key', 'residence_permit')['name']);
        $this->assertSame('Passport', collect($this->getJson('/api/v1/document-types', ['Accept-Language' => 'en'])->json('data'))->firstWhere('key', 'passport')['name']);
        $this->assertSame('Passaporto', collect($this->getJson('/api/v1/document-types', ['Accept-Language' => 'it'])->json('data'))->firstWhere('key', 'passport')['name']);
    }

    public function test_requires_authentication(): void
    {
        $this->getJson('/api/v1/my-documents')->assertUnauthorized();
        $this->postJson('/api/v1/my-documents', [])->assertUnauthorized();
        $this->getJson('/api/v1/my-documents/1/attachments/1')->assertUnauthorized();
    }

    public function test_creating_requires_document_storage_consent(): void
    {
        $this->user(consent: false);
        $this->postJson('/api/v1/my-documents', ['type' => 'passport'])
            ->assertForbidden()->assertJsonPath('error.code', 'consent_required')->assertJsonPath('error.details.purpose.0', 'document_storage');
        $this->assertSame(0, UserDocument::count());
    }

    public function test_create_and_show_with_status_fields(): void
    {
        $this->user();
        $d = $this->make();

        $this->assertSame('residence_permit', $d['type']['key']);
        $this->assertSame(200, $d['days_remaining']);
        $this->assertSame('valid', $d['status']);
        $this->assertSame([90, 60, 30, 14, 7], $d['reminder_offsets']);
        $this->getJson("/api/v1/my-documents/{$d['id']}", ['Accept-Language' => 'it'])->assertOk()->assertJsonPath('data.status_label', 'Valido');
    }

    public function test_status_and_days_remaining(): void
    {
        $this->user();
        $cases = [
            ['expiry_date' => now()->subDays(3)->toDateString(), 'expired', -3],
            ['expiry_date' => now()->toDateString(), 'expiring_soon', 0],
            ['expiry_date' => now()->addDays(90)->toDateString(), 'expiring_soon', 90],
            ['expiry_date' => now()->addDays(91)->toDateString(), 'valid', 91],
            ['expiry_date' => null, 'no_expiry', null],
        ];
        foreach ($cases as $c) {
            $d = $this->make(['issue_date' => null, 'expiry_date' => $c['expiry_date']]);
            $this->assertSame($c[0], $d['status'], json_encode($c));
            $this->assertSame($c[1], $d['days_remaining']);
        }
    }

    public function test_validation(): void
    {
        $this->user();
        $bad = fn (array $o) => $this->postJson('/api/v1/my-documents', array_merge(['type' => 'passport'], $o))->assertStatus(422);

        $this->postJson('/api/v1/my-documents', [])->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['type']]]);
        $bad(['type' => 'nope']);
        $bad(['issue_date' => now()->addDay()->toDateString()]);
        $bad(['issue_date' => '2020-01-01', 'expiry_date' => '2019-12-31']);
        $bad(['expiry_date' => 'not-a-date']);
        $bad(['expiry_date' => '2400-01-01']);
        $bad(['reminder_offsets' => [30, 30]]);
        $bad(['reminder_offsets' => [-1]]);
        $bad(['reminder_offsets' => [999]]);
        $bad(['reminder_offsets' => range(1, 11)]);
        $bad(['label' => str_repeat('x', 101)]);
        $bad(['notes' => str_repeat('x', 2001)]);
    }

    public function test_html_is_stripped_and_sensitive_columns_are_encrypted_at_rest(): void
    {
        $user = $this->user();
        $d = $this->make(['label' => '<b>Mio</b> permesso', 'notes' => 'Segreto <script>x</script>PIN 1234']);

        $this->assertSame('Mio permesso', $d['label']);
        $raw = DB::table('user_documents')->where('user_id', $user->id)->first();
        $this->assertStringNotContainsString('permesso', $raw->label);
        $this->assertStringNotContainsString('PIN 1234', $raw->notes);
        $this->assertSame('Segreto xPIN 1234', UserDocument::first()->notes);
    }

    public function test_list_sorted_by_soonest_expiry_with_no_expiry_last_and_filters(): void
    {
        $this->user();
        $this->make(['label' => 'none', 'issue_date' => null, 'expiry_date' => null]);
        $this->make(['label' => 'late', 'expiry_date' => now()->addDays(300)->toDateString()]);
        $this->make(['label' => 'soon', 'expiry_date' => now()->addDays(20)->toDateString()]);
        $this->make(['label' => 'gone', 'type' => 'passport', 'issue_date' => null, 'expiry_date' => now()->subDays(5)->toDateString()]);

        $labels = fn (string $qs = '') => collect($this->getJson("/api/v1/my-documents$qs")->assertOk()->json('data'))->pluck('label')->all();
        $this->assertSame(['gone', 'soon', 'late', 'none'], $labels());
        $this->assertSame(['none', 'late', 'soon', 'gone'] === $labels('?sort=-expiry_date'), false);
        $this->assertSame(['soon'], $labels('?filter[status]=expiring_soon'));
        $this->assertSame(['gone'], $labels('?filter[status]=expired'));
        $this->assertSame(['late'], $labels('?filter[status]=valid'));
        $this->assertSame(['none'], $labels('?filter[status]=no_expiry'));
        $this->assertSame(['gone'], $labels('?filter[type]=passport'));
        $this->getJson('/api/v1/my-documents?filter[status]=bogus')->assertStatus(422);
    }

    public function test_update_partially_and_changes_reminder_schedule(): void
    {
        $this->user();
        $d = $this->make();

        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['reminder_offsets' => [7, 45, 3]])->assertOk()
            ->assertJsonPath('data.reminder_offsets', [45, 7, 3])->assertJsonPath('data.label', 'My permit');
        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['reminders_enabled' => false])->assertOk()->assertJsonPath('data.reminders_enabled', false);
        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['expiry_date' => now()->subYears(2)->toDateString()])->assertStatus(422); // before issue date
    }

    public function test_list_has_no_n_plus_one(): void
    {
        $this->user();
        foreach (range(1, 12) as $i) {
            $this->make(['label' => "d$i"]);
        }
        $count = 0;
        DB::listen(function () use (&$count) {
            $count++;
        });
        $this->getJson('/api/v1/my-documents')->assertOk();

        $this->assertLessThanOrEqual(7, $count, "ran $count queries");
    }

    // ---- ownership (IDOR) ---------------------------------------------------------------------

    public function test_other_users_documents_are_invisible_everywhere(): void
    {
        $owner = $this->user();
        $d = $this->make();
        $this->upload($d['id'], $this->file('a.pdf', $this->pdf()))->assertCreated();
        $attId = DocumentAttachment::first()->id;

        $this->user(); // another user now acts
        $this->getJson("/api/v1/my-documents/{$d['id']}")->assertNotFound();
        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['label' => 'hacked'])->assertNotFound();
        $this->deleteJson("/api/v1/my-documents/{$d['id']}")->assertNotFound();
        $this->upload($d['id'], $this->file('a.pdf', $this->pdf()))->assertNotFound();
        $this->get("/api/v1/my-documents/{$d['id']}/attachments/$attId", ['Accept' => 'application/json'])->assertNotFound();
        $this->deleteJson("/api/v1/my-documents/{$d['id']}/attachments/$attId")->assertNotFound();
        $this->assertSame([], $this->getJson('/api/v1/my-documents')->json('data'));

        $this->assertSame('My permit', UserDocument::first()->label);
        $this->assertSame($owner->id, UserDocument::first()->user_id);
    }

    // ---- attachments --------------------------------------------------------------------------

    public function test_upload_stores_encrypted_random_path_and_download_returns_exact_bytes_with_safe_headers(): void
    {
        $user = $this->user();
        $d = $this->make();
        $bytes = $this->pdf('% passport scan content');

        $res = $this->upload($d['id'], $this->file('../../etc/passwd/Passaporto Mohamed.pdf', $bytes))->assertCreated();
        $att = DocumentAttachment::first();

        $this->assertSame('application/pdf', $att->mime);
        $this->assertSame(strlen($bytes), $att->size);
        $this->assertSame('Passaporto Mohamed.pdf', $att->original_name); // path stripped
        $this->assertSame('Passaporto Mohamed.pdf', $res->json('data.attachments.0.name'));
        $this->assertMatchesRegularExpression('#^'.$user->id.'/[0-9a-f-]{36}\.pdf\.enc$#', $att->storage_path);

        $onDisk = Storage::disk('documents')->get($att->storage_path);
        $this->assertStringNotContainsString('passport scan content', $onDisk);
        $this->assertStringNotContainsString('%PDF', $onDisk);

        $dl = $this->get("/api/v1/my-documents/{$d['id']}/attachments/{$att->id}", ['Accept' => 'application/json'])->assertOk();
        $this->assertSame($bytes, $dl->getContent());
        $dl->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertStringContainsString('attachment;', $dl->headers->get('Content-Disposition'));
        $this->assertStringContainsString('no-store', $dl->headers->get('Cache-Control'));
        $this->assertNotNull(AuditLog::firstWhere('action', 'document.attachment_downloaded'));
    }

    public function test_png_is_accepted(): void
    {
        $this->user();
        $d = $this->make();
        $this->upload($d['id'], $this->file('scan.png', $this->png()))->assertCreated()->assertJsonPath('data.attachments.0.mime', 'image/png');
    }

    public function test_encryption_can_be_disabled_by_config(): void
    {
        config(['documents.encrypt_at_rest' => false]);
        $this->user();
        $d = $this->make();
        $this->upload($d['id'], $this->file('a.pdf', $this->pdf()))->assertCreated();
        $att = DocumentAttachment::first();

        $this->assertStringEndsWith('.pdf', $att->storage_path);
        $this->assertStringStartsWith('%PDF', Storage::disk('documents')->get($att->storage_path));
        $this->get("/api/v1/my-documents/{$d['id']}/attachments/{$att->id}", ['Accept' => 'application/json'])->assertOk();
    }

    public function test_dangerous_or_spoofed_files_are_rejected_by_content_not_extension(): void
    {
        $this->user();
        $d = $this->make();
        $reject = fn (string $name, string $bytes, string $code) => $this->upload($d['id'], $this->file($name, $bytes))
            ->assertStatus(422)->assertJsonPath('error.code', $code);

        $reject('invoice.pdf', "MZ\x90\x00\x03\x00\x00\x00 fake windows executable", 'attachment_type_not_allowed');
        $reject('photo.jpg', '<html><script>alert(1)</script></html>', 'attachment_type_not_allowed');
        $reject('shell.php', '<?php system($_GET["c"]); ?>', 'attachment_type_not_allowed');
        $reject('doc.pdf.exe', "#!/bin/sh\nrm -rf /", 'attachment_type_not_allowed');
        $reject('vector.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', 'attachment_type_not_allowed');
        $reject('a.pdf', $this->pdf('<</S/JavaScript/JS(app.alert(1))>>'), 'attachment_rejected');
        $reject('b.pdf', $this->pdf('<</OpenAction 5 0 R>>'), 'attachment_rejected');
        $reject('c.pdf', $this->pdf('<</Type/Filespec/EF<</F 1 0 R>>/EmbeddedFile>>'), 'attachment_rejected');
        $reject('poly.png', $this->png().'<?php system($_GET["x"]); ?>', 'attachment_rejected');

        $this->assertSame(0, DocumentAttachment::count());
        $this->assertSame([], Storage::disk('documents')->allFiles());
    }

    public function test_pdf_with_benign_names_that_merely_resemble_active_tokens_is_accepted(): void
    {
        $this->user();
        $d = $this->make();
        // "/JSON" and "/AAPL" are not the /JS or /AA actions
        $this->upload($d['id'], $this->file('ok.pdf', $this->pdf('/JSON /AAPL /OpenActions')))->assertCreated();
    }

    public function test_size_limits_and_empty_files(): void
    {
        $this->user();
        $d = $this->make();

        $this->upload($d['id'], $this->file('empty.pdf', ''))->assertStatus(422)->assertJsonPath('error.code', 'attachment_invalid_size');

        config(['documents.max_file_kb' => 1]);
        $this->upload($d['id'], $this->file('big.pdf', $this->pdf(str_repeat('A', 2048))))
            ->assertStatus(422)->assertJsonPath('error.code', 'attachment_invalid_size');
    }

    public function test_file_count_and_user_quota_limits(): void
    {
        $this->user();
        $d = $this->make();

        config(['documents.max_files_per_document' => 2]);
        $this->upload($d['id'], $this->file('1.pdf', $this->pdf()))->assertCreated();
        $this->upload($d['id'], $this->file('2.pdf', $this->pdf()))->assertCreated();
        $this->upload($d['id'], $this->file('3.pdf', $this->pdf()))->assertStatus(422)->assertJsonPath('error.code', 'attachment_limit_reached');

        config(['documents.max_files_per_document' => 10, 'documents.max_total_mb_per_user' => 0.0001]); // ~104 bytes
        $this->upload($d['id'], $this->file('4.pdf', $this->pdf(str_repeat('A', 500))))
            ->assertStatus(422)->assertJsonPath('error.code', 'storage_quota_exceeded');
    }

    public function test_upload_requires_file_and_consent(): void
    {
        $this->user();
        $d = $this->make();
        $this->postJson("/api/v1/my-documents/{$d['id']}/attachments", [])->assertStatus(422);

        $user = auth()->user();
        app(ConsentService::class)->record($user, ['document_storage' => false]);
        $this->upload($d['id'], $this->file('a.pdf', $this->pdf()))->assertForbidden()->assertJsonPath('error.code', 'consent_required');
    }

    public function test_withdrawn_consent_still_allows_viewing_and_deleting(): void
    {
        $user = $this->user();
        $d = $this->make();
        app(ConsentService::class)->record($user, ['document_storage' => false]);

        $this->getJson("/api/v1/my-documents/{$d['id']}")->assertOk();
        $this->postJson('/api/v1/my-documents', ['type' => 'passport'])->assertForbidden();
        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['label' => 'x'])->assertForbidden();
        $this->deleteJson("/api/v1/my-documents/{$d['id']}")->assertNoContent();
    }

    public function test_deleting_attachment_or_document_removes_files_from_disk(): void
    {
        $this->user();
        $d = $this->make();
        $this->upload($d['id'], $this->file('1.pdf', $this->pdf()))->assertCreated();
        $this->upload($d['id'], $this->file('2.png', $this->png()))->assertCreated();
        $this->assertCount(2, Storage::disk('documents')->allFiles());

        $first = DocumentAttachment::orderBy('id')->first();
        $this->deleteJson("/api/v1/my-documents/{$d['id']}/attachments/{$first->id}")->assertNoContent();
        $this->assertCount(1, Storage::disk('documents')->allFiles());

        $this->deleteJson("/api/v1/my-documents/{$d['id']}")->assertNoContent();
        $this->assertSame([], Storage::disk('documents')->allFiles());
        $this->assertSame(0, DocumentAttachment::count());
    }

    public function test_attachment_id_from_another_document_is_not_reachable(): void
    {
        $this->user();
        $a = $this->make(['label' => 'a']);
        $b = $this->make(['label' => 'b']);
        $this->upload($b['id'], $this->file('1.pdf', $this->pdf()))->assertCreated();
        $attId = DocumentAttachment::first()->id;

        $this->get("/api/v1/my-documents/{$a['id']}/attachments/$attId", ['Accept' => 'application/json'])->assertNotFound();
    }

    public function test_documents_disk_is_private_and_not_served(): void
    {
        $this->assertFalse(config('filesystems.disks.documents.serve'));
        $this->assertSame('private', config('filesystems.disks.documents.visibility'));
        $this->assertStringNotContainsString('public', config('filesystems.disks.documents.root'));
    }

    public function test_audit_trail_never_contains_document_content(): void
    {
        $this->user();
        $d = $this->make(['label' => 'SecretLabel', 'notes' => 'SecretNotes']);
        $this->patchJson("/api/v1/my-documents/{$d['id']}", ['label' => 'SecretLabel2'])->assertOk();

        $this->assertNotNull(AuditLog::firstWhere('action', 'document.created'));
        $dump = json_encode(AuditLog::all()->toArray());
        $this->assertStringNotContainsString('Secret', $dump);
    }

    // ---- privacy ------------------------------------------------------------------------------

    public function test_export_includes_documents_and_erasure_removes_rows_and_files(): void
    {
        $user = $this->user();
        $d = $this->make(['label' => 'Export me']);
        $this->upload($d['id'], $this->file('1.pdf', $this->pdf()))->assertCreated();

        $export = $this->getJson('/api/v1/profile/export')->assertOk();
        $export->assertJsonPath('data.documents.0.label', 'Export me')->assertJsonPath('data.documents.0.attachments.0.name', '1.pdf');
        $this->assertStringNotContainsString('storage_path', $export->getContent());

        $this->deleteJson('/api/v1/profile', ['password' => 'password'])->assertStatus(202);

        $this->assertSame(0, UserDocument::where('user_id', $user->id)->count());
        $this->assertSame(0, DocumentAttachment::where('user_id', $user->id)->count());
        $this->assertSame([], Storage::disk('documents')->allFiles());
    }
}

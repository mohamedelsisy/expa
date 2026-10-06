<?php

namespace App\Domains\Documents\Services;

use App\Domains\Documents\Contracts\ContentScanner;
use Closure;

/**
 * ClamAV through the clamd INSTREAM protocol (TCP or unix socket). The file is streamed, never passed by path, so clamd
 * does not need access to the web server's filesystem.
 *
 * Reasons: `malware_detected` (signature found), `scanner_unavailable` (daemon unreachable / timed out / answered
 * with an error). Unreachable is FAIL-CLOSED by default: an upload that could not be scanned is rejected, never stored.
 * CLAMAV_FAIL_CLOSED=false (non-production only, see preflight) accepts such uploads and logs a warning.
 *
 * Protocol: "zINSTREAM\0", then repeated [4-byte big-endian length][data], terminated by a zero length chunk. The reply
 * is a NUL-terminated line: "stream: OK", "stream: <Signature> FOUND" or "... ERROR".
 */
class ClamdScanner implements ContentScanner
{
    public const MALWARE = 'malware_detected';

    public const UNAVAILABLE = 'scanner_unavailable';

    /** @var Closure():mixed */
    private Closure $connector;

    /**
     * @param  array{host?:string,port?:int,socket?:?string,timeout?:int|float,fail_closed?:bool,chunk_size?:int}  $config
     * @param  (Closure():mixed)|null  $connector  returns a connected stream resource or false (injectable for tests)
     */
    public function __construct(private array $config = [], ?Closure $connector = null)
    {
        $this->connector = $connector ?? fn () => $this->connect();
    }

    public function reject(string $absolutePath, string $detectedMime): ?string
    {
        $result = $this->scan($absolutePath);
        if ($result === null) {
            return null;
        }
        if ($result === self::UNAVAILABLE && ! ($this->config['fail_closed'] ?? true)) {
            logger()->warning('clamav.unavailable_fail_open');

            return null;
        }

        return $result;
    }

    private function scan(string $path): ?string
    {
        $file = @fopen($path, 'rb');
        if ($file === false) {
            return self::UNAVAILABLE;
        }
        $stream = null;
        try {
            $stream = ($this->connector)();
            if (! is_resource($stream)) {
                return self::UNAVAILABLE;
            }
            stream_set_timeout($stream, (int) ceil((float) ($this->config['timeout'] ?? 5)));

            if (! $this->writeAll($stream, "zINSTREAM\0")) {
                return self::UNAVAILABLE;
            }
            $chunk = max(1024, (int) ($this->config['chunk_size'] ?? 65536));
            while (! feof($file)) {
                $data = fread($file, $chunk);
                if ($data === false) {
                    return self::UNAVAILABLE;
                }
                if ($data === '') {
                    continue;
                }
                if (! $this->writeAll($stream, pack('N', strlen($data)).$data)) {
                    return self::UNAVAILABLE;
                }
            }
            if (! $this->writeAll($stream, pack('N', 0))) {
                return self::UNAVAILABLE;
            }

            return $this->interpret($this->readReply($stream));
        } catch (\Throwable) {
            return self::UNAVAILABLE; // never include the path/bytes in logs or exceptions
        } finally {
            fclose($file);
            if (is_resource($stream)) {
                @fclose($stream);
            }
        }
    }

    private function interpret(?string $reply): ?string
    {
        $reply = trim((string) $reply, "\0 \n\r");
        if ($reply === '') {
            return self::UNAVAILABLE;
        }
        if (str_ends_with($reply, ' OK')) {
            return null;
        }
        if (str_ends_with($reply, ' FOUND')) {
            return self::MALWARE;
        }

        return self::UNAVAILABLE; // "... ERROR" (size limit, internal failure) or anything unexpected: fail closed
    }

    /** @param  resource  $stream */
    private function writeAll($stream, string $data): bool
    {
        $len = strlen($data);
        for ($written = 0; $written < $len;) {
            $n = @fwrite($stream, substr($data, $written));
            if ($n === false || $n === 0) {
                return false;
            }
            $written += $n;
        }

        return true;
    }

    /** @param  resource  $stream */
    private function readReply($stream): ?string
    {
        $reply = '';
        while (! feof($stream) && strlen($reply) < 4096) {
            $part = fread($stream, 1024);
            if ($part === false || $part === '') {
                if (stream_get_meta_data($stream)['timed_out'] ?? false) {
                    return null;
                }
                break;
            }
            $reply .= $part;
            if (str_contains($reply, "\0") || str_contains($reply, "\n")) {
                break;
            }
        }

        return $reply;
    }

    /** @return resource|false */
    private function connect()
    {
        $timeout = (float) ($this->config['timeout'] ?? 5);
        $socket = $this->config['socket'] ?? null;
        $address = $socket ? 'unix://'.$socket : 'tcp://'.($this->config['host'] ?? '127.0.0.1').':'.(int) ($this->config['port'] ?? 3310);

        return @stream_socket_client($address, $errno, $error, $timeout);
    }
}

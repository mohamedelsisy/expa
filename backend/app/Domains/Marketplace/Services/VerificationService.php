<?php

namespace App\Domains\Marketplace\Services;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Marketplace\Enums\VerificationStatus;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Exceptions\ApiException;
use App\Models\User;

/** unverified -> pending (provider asks) -> verified (admin, with basis + expiry) | back to unverified (rejected / revoked). */
class VerificationService
{
    public function __construct(private AuditLogger $audit) {}

    public function request(ServiceProvider $p): ServiceProvider
    {
        if ($p->verification_status === VerificationStatus::Pending) {
            throw new ApiException('verification_already_pending', __('marketplace.verification_already_pending'), 409);
        }
        if ($p->evidence()->count() === 0) {
            throw new ApiException('verification_evidence_required', __('marketplace.verification_evidence_required'), 422);
        }
        $p->forceFill(['verification_status' => VerificationStatus::Pending, 'verification_requested_at' => now()])->save();
        $this->audit->log('marketplace.verification_requested', $p);

        return $p;
    }

    public function approve(ServiceProvider $p, User $admin, string $basis, ?\DateTimeInterface $expiresAt = null): ServiceProvider
    {
        $expiresAt ??= now()->addDays((int) config('marketplace.verification_valid_days'));
        if ($expiresAt <= now()) {
            throw new ApiException('invalid_expiry', __('marketplace.invalid_expiry'), 422);
        }
        $p->forceFill([
            'verification_status' => VerificationStatus::Verified, 'verified_by' => $admin->id, 'verified_at' => now(),
            'verification_expires_at' => $expiresAt, 'verification_basis' => $basis,
        ])->save();
        $this->audit->log('marketplace.verified', $p, ['expires_at' => $expiresAt->format('Y-m-d')]);

        return $p;
    }

    /** Reject a pending request or revoke a verification: back to unverified. The reason is kept for the audit trail only. */
    public function reject(ServiceProvider $p, User $admin, string $reason): ServiceProvider
    {
        $was = $p->verification_status->value;
        $p->forceFill([
            'verification_status' => VerificationStatus::Unverified, 'verified_by' => null, 'verified_at' => null,
            'verification_expires_at' => null, 'verification_basis' => null, 'verification_requested_at' => null,
        ])->save();
        $this->audit->log('marketplace.verification_rejected', $p, ['was' => $was, 'reason' => mb_substr($reason, 0, 255)]);

        return $p;
    }
}

/// Typed errors produced by the API client. UI maps them to localized messages by type, never by raw text.
sealed class ApiException implements Exception {
  const ApiException(this.message, {this.code, this.statusCode, this.details = const {}});

  /// Server-provided (already localized) message, when there is one.
  final String message;
  final String? code;
  final int? statusCode;
  final Map<String, List<String>> details;

  @override
  String toString() => '$runtimeType($code, $statusCode)';
}

class NetworkException extends ApiException {
  const NetworkException([super.message = 'network']) : super(code: 'network');
}

class TimeoutApiException extends ApiException {
  const TimeoutApiException([super.message = 'timeout']) : super(code: 'timeout');
}

/// 401. [invalidCredentials] is true for a failed login (not an expired session).
class UnauthorizedException extends ApiException {
  const UnauthorizedException(super.message, {super.code, super.details}) : super(statusCode: 401);
  bool get invalidCredentials => code == 'invalid_credentials';
}

class ForbiddenException extends ApiException {
  const ForbiddenException(super.message, {super.code, super.details}) : super(statusCode: 403);
  bool get consentRequired => code == 'consent_required';
  bool get emailNotVerified => code == 'email_not_verified';
}

class NotFoundException extends ApiException {
  const NotFoundException(super.message, {super.code}) : super(statusCode: 404);
}

class ValidationException extends ApiException {
  const ValidationException(super.message, {super.code, super.details}) : super(statusCode: 422);
}

class RateLimitedException extends ApiException {
  const RateLimitedException(super.message, {super.code, super.statusCode = 429});
  bool get aiLimitReached => code == 'ai_limit_reached';
}

class ServerException extends ApiException {
  const ServerException(super.message, {super.code, super.statusCode});
}

/// Any other non-2xx or an unreadable body.
class UnknownApiException extends ApiException {
  const UnknownApiException(super.message, {super.code, super.statusCode, super.details});
}

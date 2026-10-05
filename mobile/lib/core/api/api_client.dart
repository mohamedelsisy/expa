import 'package:dio/dio.dart';

import 'api_exception.dart';
import 'api_response.dart';

typedef TokenReader = Future<String?> Function();
typedef LocaleReader = String Function();

/// HTTP client for the EXPA API (`/api/v1`): bearer token, `?lang=` + `Accept-Language`,
/// success/error envelope parsing and typed errors. Never logs request/response bodies or headers.
class ApiClient {
  ApiClient({
    required String baseUrl,
    required this.readToken,
    required this.readLocale,
    this.onUnauthorized,
    this.onNetworkResult,
    Dio? dio,
  }) : _dio = dio ?? Dio() {
    _dio.options
      ..baseUrl = baseUrl
      ..connectTimeout = const Duration(seconds: 15)
      ..receiveTimeout = const Duration(seconds: 30)
      ..headers['Accept'] = 'application/json'
      ..headers['X-Client'] = 'mobile'
      ..validateStatus = (_) => true; // statuses are mapped below
  }

  final Dio _dio;
  final TokenReader readToken;
  final LocaleReader readLocale;

  /// Called when an authenticated request gets 401 (token revoked/expired). Not called for a failed login.
  Future<void> Function()? onUnauthorized;

  /// Reports whether the network was reachable for each completed request (true = got any HTTP response,
  /// false = connection error/timeout). Drives the offline banner; never carries request data.
  void Function(bool reachable)? onNetworkResult;

  /// [includeLang] must be false for signed URLs (e-mail verification): an extra query parameter would invalidate the signature.
  Future<ApiResponse> get(String path, {Map<String, dynamic>? query, bool includeLang = true}) => _send('GET', path, query: query, includeLang: includeLang);
  Future<ApiResponse> post(String path, {Object? body, Map<String, dynamic>? query}) => _send('POST', path, body: body, query: query);
  Future<ApiResponse> put(String path, {Object? body}) => _send('PUT', path, body: body);
  Future<ApiResponse> patch(String path, {Object? body}) => _send('PATCH', path, body: body);
  Future<ApiResponse> delete(String path, {Object? body}) => _send('DELETE', path, body: body);

  Future<ApiResponse> _send(String method, String path, {Object? body, Map<String, dynamic>? query, bool includeLang = true}) async {
    final token = await readToken();
    final lang = readLocale();
    final params = <String, dynamic>{...?query, if (includeLang) 'lang': lang};
    final Response<dynamic> res;
    try {
      res = await _dio.request<dynamic>(
        path,
        data: body,
        queryParameters: params,
        options: Options(method: method, headers: {
          'Accept-Language': lang,
          if (token != null) 'Authorization': 'Bearer $token',
        }),
      );
    } on DioException catch (e) {
      onNetworkResult?.call(false);
      throw switch (e.type) {
        DioExceptionType.connectionTimeout ||
        DioExceptionType.receiveTimeout ||
        DioExceptionType.sendTimeout =>
          const TimeoutApiException(),
        _ => const NetworkException(),
      };
    }

    onNetworkResult?.call(true);
    final status = res.statusCode ?? 0;
    if (status >= 200 && status < 300) {
      return parseSuccess(res.data);
    }
    final error = parseError(status, res.data);
    if (error is UnauthorizedException && !error.invalidCredentials && token != null) {
      await onUnauthorized?.call();
    }
    throw error;
  }

  /// 204 / empty body → empty response; otherwise `{data, meta}`.
  static ApiResponse parseSuccess(Object? body) {
    if (body is Map && body.containsKey('data')) {
      return ApiResponse(body['data'], ApiResponse.parseMeta(body['meta']));
    }
    return const ApiResponse(null, {});
  }

  /// `{error:{code,message,details}}` → typed exception chosen by status.
  static ApiException parseError(int status, Object? body) {
    var code = 'unknown';
    var message = '';
    final details = <String, List<String>>{};
    if (body is Map && body['error'] is Map) {
      final e = body['error'] as Map;
      code = (e['code'] ?? code).toString();
      message = (e['message'] ?? '').toString();
      final d = e['details'];
      if (d is Map) {
        d.forEach((k, v) {
          details[k.toString()] = v is List ? v.map((x) => x.toString()).toList() : [v.toString()];
        });
      }
    }
    return switch (status) {
      401 => UnauthorizedException(message, code: code, details: details),
      403 => ForbiddenException(message, code: code, details: details),
      404 => NotFoundException(message, code: code),
      422 => ValidationException(message, code: code, details: details),
      429 => RateLimitedException(message, code: code),
      >= 500 => ServerException(message, code: code, statusCode: status),
      _ => UnknownApiException(message, code: code, statusCode: status, details: details),
    };
  }
}

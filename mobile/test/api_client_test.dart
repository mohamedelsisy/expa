import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:expa_mobile/core/api/api_client.dart';
import 'package:expa_mobile/core/api/api_exception.dart';
import 'package:flutter_test/flutter_test.dart';

class FakeAdapter implements HttpClientAdapter {
  FakeAdapter(this.handler);
  final ResponseBody Function(RequestOptions) handler;
  final List<RequestOptions> requests = [];
  @override
  void close({bool force = false}) {}
  @override
  Future<ResponseBody> fetch(RequestOptions options, Stream<Uint8List>? requestStream, Future<void>? cancelFuture) async {
    requests.add(options);
    return handler(options);
  }
}

ResponseBody json(int status, Object? body) =>
    ResponseBody.fromString(jsonEncode(body), status, headers: {Headers.contentTypeHeader: ['application/json']});

ApiClient client(FakeAdapter a, {String? token = 'tok', String lang = 'ar', Future<void> Function()? onUnauth}) {
  final dio = Dio()..httpClientAdapter = a;
  return ApiClient(baseUrl: 'https://api.test/api/v1', readToken: () async => token, readLocale: () => lang, onUnauthorized: onUnauth, dio: dio);
}

void main() {
  test('parses the {data, meta} envelope and sends bearer token and language', () async {
    final a = FakeAdapter((_) => json(200, {'data': [1, 2], 'meta': {'locale': 'ar', 'page': 1, 'last_page': 3}}));
    final r = await client(a).get('/guides', query: {'page': 1});
    expect(r.list, [1, 2]);
    expect(r.page, 1);
    expect(r.lastPage, 3);
    final req = a.requests.single;
    expect(req.headers['Authorization'], 'Bearer tok');
    expect(req.headers['Accept-Language'], 'ar');
    expect(req.queryParameters['lang'], 'ar');
    expect(req.uri.toString(), startsWith('https://api.test/api/v1/guides'));
  });

  test('no Authorization header without a token; locale follows the reader', () async {
    final a = FakeAdapter((_) => json(200, {'data': {}, 'meta': []}));
    await client(a, token: null, lang: 'it').get('/guides');
    expect(a.requests.single.headers.containsKey('Authorization'), isFalse);
    expect(a.requests.single.queryParameters['lang'], 'it');
  });

  test('meta serialised as a JSON list (PHP empty array) is tolerated', () async {
    final a = FakeAdapter((_) => json(200, {'data': {'x': 1}, 'meta': []}));
    final r = await client(a).get('/x');
    expect(r.meta, isEmpty);
    expect(r.map['x'], 1);
  });

  test('204 with empty body yields an empty response', () async {
    final a = FakeAdapter((_) => ResponseBody.fromString('', 204));
    final r = await client(a).post('/auth/logout');
    expect(r.data, isNull);
  });

  test('error envelope maps to typed exceptions', () {
    expect(ApiClient.parseError(422, {'error': {'code': 'validation_failed', 'message': 'm', 'details': {'email': ['bad']}}}), isA<ValidationException>());
    final v = ApiClient.parseError(422, {'error': {'code': 'validation_failed', 'message': 'm', 'details': {'email': ['bad']}}});
    expect(v.details['email'], ['bad']);
    expect(v.code, 'validation_failed');
    expect(ApiClient.parseError(403, {'error': {'code': 'consent_required', 'message': 'x'}}), isA<ForbiddenException>().having((e) => e.consentRequired, 'consentRequired', true));
    expect(ApiClient.parseError(403, {'error': {'code': 'email_not_verified', 'message': 'x'}}), isA<ForbiddenException>().having((e) => e.emailNotVerified, 'flag', true));
    expect(ApiClient.parseError(404, {'error': {'code': 'not_found', 'message': 'x'}}), isA<NotFoundException>());
    expect(ApiClient.parseError(429, {'error': {'code': 'ai_limit_reached', 'message': 'x'}}), isA<RateLimitedException>().having((e) => e.aiLimitReached, 'ai', true));
    expect(ApiClient.parseError(500, {'error': {'code': 'server_error', 'message': 'x'}}), isA<ServerException>());
    expect(ApiClient.parseError(502, '<html>bad gateway</html>'), isA<ServerException>());
    expect(ApiClient.parseError(409, {'error': {'code': 'exam_already_finished', 'message': 'x'}}), isA<UnknownApiException>().having((e) => e.code, 'code', 'exam_already_finished'));
  });

  test('throws the typed exception from a live request', () async {
    final a = FakeAdapter((_) => json(422, {'error': {'code': 'validation_failed', 'message': 'bad', 'details': {'email': ['taken']}}}));
    await expectLater(client(a).post('/auth/register', body: {}), throwsA(isA<ValidationException>()));
  });

  test('401 on an authenticated request triggers the unauthorized callback', () async {
    var called = 0;
    final a = FakeAdapter((_) => json(401, {'error': {'code': 'unauthenticated', 'message': 'x'}}));
    await expectLater(client(a, onUnauth: () async => called++).get('/dashboard'), throwsA(isA<UnauthorizedException>()));
    expect(called, 1);
  });

  test('401 invalid_credentials (failed login) does NOT trigger logout handling', () async {
    var called = 0;
    final a = FakeAdapter((_) => json(401, {'error': {'code': 'invalid_credentials', 'message': 'x'}}));
    await expectLater(client(a, onUnauth: () async => called++).post('/auth/login', body: {}), throwsA(isA<UnauthorizedException>().having((e) => e.invalidCredentials, 'creds', true)));
    expect(called, 0);
  });

  test('401 without a token does not trigger logout handling', () async {
    var called = 0;
    final a = FakeAdapter((_) => json(401, {'error': {'code': 'unauthenticated', 'message': 'x'}}));
    await expectLater(client(a, token: null, onUnauth: () async => called++).get('/dashboard'), throwsA(isA<UnauthorizedException>()));
    expect(called, 0);
  });

  test('connection failures become NetworkException, timeouts TimeoutApiException', () async {
    final net = FakeAdapter((o) => throw DioException(requestOptions: o, type: DioExceptionType.connectionError));
    await expectLater(client(net).get('/x'), throwsA(isA<NetworkException>()));
    final to = FakeAdapter((o) => throw DioException(requestOptions: o, type: DioExceptionType.receiveTimeout));
    await expectLater(client(to).get('/x'), throwsA(isA<TimeoutApiException>()));
  });
}

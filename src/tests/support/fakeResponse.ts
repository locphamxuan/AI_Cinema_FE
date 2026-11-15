/**
 * A fetch answer the API client can read: `body` as JSON text, `null` or `undefined` as an empty body.
 * Plain data rather than a Response, so one instance may answer several calls.
 */
export function fakeResponse(body: unknown, status = 200) {
  const text = body === undefined || body === null ? '' : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: async () => JSON.parse(text),
    text: async () => text,
  };
}

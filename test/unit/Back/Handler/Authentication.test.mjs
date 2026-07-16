import assert from "node:assert/strict";
import {EventEmitter} from "node:events";
import test from "node:test";

import Authentication from "../../../../src/Back/Handler/Authentication.mjs";
import Contract from "../../../../src/Contract/Authentication.mjs";

const STAGE = {PROCESS: "PROCESS"};
const dtoInfoFactory = {create: (value) => Object.freeze(value)};
const contract = new Contract();

function request({method = "POST", url, headers = {"content-type": "application/json"}, body = ""}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = headers;
  req.destroy = () => {};
  queueMicrotask(() => {
    if (body) req.emit("data", Buffer.from(body));
    req.emit("end");
  });
  return req;
}

function response() {
  return {
    status: undefined,
    headers: undefined,
    body: undefined,
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    end(body) { this.body = body; },
  };
}

test("sets a narrow opaque session cookie after WebAuthn authentication", async () => {
  const auth = {
    authenticationVerify: async () => ({
      verified: true,
      session: {token: "opaque-token", expiresAt: new Date(Date.now() + 60_000).toISOString(), surface: "mob"},
    }),
  };
  const handler = new Authentication({dtoInfoFactory, STAGE, contract, auth});
  const context = {
    request: request({url: contract.routes.authenticationVerify, body: JSON.stringify({ceremonyId: "id", surface: "mob", response: {id: "credential"}})}),
    response: response(),
    completed: false,
  };

  await handler.handle(context);

  assert.equal(context.response.status, 200);
  assert.match(context.response.headers["Set-Cookie"], /^alarisa_session=opaque-token;/);
  assert.match(context.response.headers["Set-Cookie"], /Path=\/api\/v1\//);
  assert.match(context.response.headers["Set-Cookie"], /Secure/);
  assert.match(context.response.headers["Set-Cookie"], /HttpOnly/);
  assert.match(context.response.headers["Set-Cookie"], /SameSite=Strict/);
  assert.equal(context.completed, true);
});

test("reports the fixed Principal session without exposing its opaque token", async () => {
  const auth = {resolveSession: async ({token}) => {
    assert.equal(token, "opaque-token");
    return {principalId: "principal", credentialId: "credential", surface: "desk", expiresAt: "2099-01-01T00:00:00.000Z"};
  }};
  const handler = new Authentication({dtoInfoFactory, STAGE, contract, auth});
  const context = {
    request: request({method: "GET", url: contract.routes.session, headers: {cookie: "alarisa_session=opaque-token"}}),
    response: response(),
    completed: false,
  };

  await handler.handle(context);

  const body = JSON.parse(context.response.body);
  assert.equal(body.authenticated, true);
  assert.equal(body.principalId, "principal");
  assert.equal("token" in body, false);
});

test("expires the cookie on explicit logout", async () => {
  let revoked;
  const auth = {revokeSession: async ({token}) => { revoked = token; }};
  const handler = new Authentication({dtoInfoFactory, STAGE, contract, auth});
  const context = {
    request: request({url: contract.routes.logout, headers: {cookie: "alarisa_session=opaque-token"}}),
    response: response(),
    completed: false,
  };

  await handler.handle(context);

  assert.equal(revoked, "opaque-token");
  assert.match(context.response.headers["Set-Cookie"], /Max-Age=0/);
});

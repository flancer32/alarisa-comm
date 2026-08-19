// @ts-nocheck
import assert from "node:assert/strict";
import {EventEmitter} from "node:events";
import test from "node:test";

import WorldPictureContract from "../../../../src/Contract/WorldPicture.mjs";
import WorldPictureHandler from "../../../../src/Back/Handler/WorldPicture.mjs";

const STAGE = {PROCESS: "PROCESS"};
const dtoInfoFactory = {create: (value) => Object.freeze(value)};
const contract = new WorldPictureContract();

function request({method = "GET", url, headers = {}}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = headers;
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

function handler(read) {
  return new WorldPictureHandler({dtoInfoFactory, STAGE, contract, read});
}

test("returns the exact State tree DTO and delegates an optional focus", async () => {
  const calls = [];
  const dto = {selection: {kind: "tree", objectId: 12}, objects: [{id: 12}], tree: [{objectId: 12, children: [], crossLinkRelationIds: []}]};
  const subject = handler({tree: async (input) => { calls.push(input); return dto; }, node: async () => assert.fail("must not run")});
  const context = {request: request({url: `${contract.routes.tree}?focus=12`}), response: response(), completed: false};

  await subject.handle(context);

  assert.deepEqual(calls, [{focusObjectId: 12}]);
  assert.equal(context.response.status, 200);
  assert.equal(context.response.headers["Cache-Control"], "no-store");
  assert.deepEqual(JSON.parse(context.response.body), dto);
  assert.equal(context.completed, true);
});

test("returns the exact State node DTO and delegates its State identity", async () => {
  const calls = [];
  const dto = {selection: {kind: "node", objectId: 7}, objects: [{id: 7}], relations: []};
  const subject = handler({tree: async () => assert.fail("must not run"), node: async (input) => { calls.push(input); return dto; }});
  const context = {request: request({url: `${contract.routes.nodePrefix}7`}), response: response(), completed: false};

  await subject.handle(context);

  assert.deepEqual(calls, [{objectId: 7}]);
  assert.equal(context.response.status, 200);
  assert.deepEqual(JSON.parse(context.response.body), dto);
});

test("rejects malformed State identities without calling State", async () => {
  const subject = handler({tree: async () => assert.fail("must not run"), node: async () => assert.fail("must not run")});
  for (const url of [`${contract.routes.tree}?focus=0`, `${contract.routes.tree}?focus=1&focus=2`, `${contract.routes.nodePrefix}abc`]) {
    const context = {request: request({url}), response: response(), completed: false};
    await subject.handle(context);
    assert.equal(context.response.status, 400);
    assert.equal(context.response.headers["Cache-Control"], "no-store");
  }
});

test("returns a non-leaking 404 for an unknown State selection", async () => {
  const error = new Error("Object 7 is not active.");
  error.name = "ReadSelectionError";
  const subject = handler({tree: async () => assert.fail("must not run"), node: async () => { throw error; }});
  const context = {request: request({url: `${contract.routes.nodePrefix}7`}), response: response(), completed: false};

  await subject.handle(context);

  assert.equal(context.response.status, 404);
  assert.deepEqual(JSON.parse(context.response.body), {error: contract.errors.notFound});
  assert.equal(context.response.headers["Cache-Control"], "no-store");
});

test("reports unsupported route methods with no-store JSON", async () => {
  const subject = handler({tree: async () => assert.fail("must not run"), node: async () => assert.fail("must not run")});
  const context = {request: request({method: "POST", url: contract.routes.tree}), response: response(), completed: false};

  await subject.handle(context);

  assert.equal(context.response.status, 405);
  assert.equal(context.response.headers.Allow, "GET");
  assert.equal(context.response.headers["Cache-Control"], "no-store");
});

test("returns a non-leaking 503 when State reads are unavailable", async () => {
  const subject = handler({tree: async () => { throw new Error("database connection=secret"); }, node: async () => assert.fail("must not run")});
  const context = {request: request({url: contract.routes.tree}), response: response(), completed: false};

  await subject.handle(context);

  assert.equal(context.response.status, 503);
  assert.deepEqual(JSON.parse(context.response.body), {error: contract.errors.unavailable});
  assert.equal(context.response.headers["Cache-Control"], "no-store");
});


import assert from "node:assert/strict";
import {EventEmitter} from "node:events";
import test from "node:test";

import Contract from "../../../../src/Contract/PrincipalContribution.mjs";
import PrincipalContribution from "../../../../src/Back/Handler/PrincipalContribution.mjs";

const STAGE = {PROCESS: "PROCESS"};
const dtoInfoFactory = {create: (value) => Object.freeze(value)};
const contract = new Contract();

function request({method = "POST", url = contract.route, headers = {"content-type": "application/json"}, body = ""} = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = headers;
  req.destroy = () => {};
  queueMicrotask(() => {
    req.emit("data", Buffer.from(body));
    req.emit("end");
  });
  return req;
}

function response() {
  return {
    status: undefined,
    body: undefined,
    writeHead(status) { this.status = status; },
    end(body) { this.body = body; },
  };
}

test("accepts a valid versioned Principal contribution", async () => {
  const calls = [];
  const handler = new PrincipalContribution({
    dtoInfoFactory,
    STAGE,
    contract,
    ingress: {accept: async (input) => {
      calls.push(input);
      return {accepted: true, contributionId: input.contributionId};
    }},
  });
  const contributionId = "test-contribution-0001";
  const context = {
    request: request({body: JSON.stringify({contributionId, text: "  Привет  ", channel: "mob"})}),
    response: response(),
    completed: false,
  };

  await handler.handle(context);

  assert.deepEqual(calls, [{contributionId, text: "Привет", channel: "mob"}]);
  assert.equal(context.response.status, 202);
  assert.deepEqual(JSON.parse(context.response.body), {accepted: true, contributionId});
  assert.equal(context.completed, true);
});

test("rejects invalid input without calling ingress", async () => {
  let calls = 0;
  const handler = new PrincipalContribution({
    dtoInfoFactory,
    STAGE,
    contract,
    ingress: {accept: async () => { calls += 1; }},
  });
  const context = {
    request: request({body: JSON.stringify({contributionId: "short", text: "", channel: "unknown"})}),
    response: response(),
    completed: false,
  };

  await handler.handle(context);

  assert.equal(calls, 0);
  assert.equal(context.response.status, 400);
});

test("reports conflicting contribution identifiers", async () => {
  const error = new Error("Contribution identifier is already used for different content.");
  error.code = "CONTRIBUTION_CONFLICT";
  const handler = new PrincipalContribution({dtoInfoFactory, STAGE, contract, ingress: {accept: async () => { throw error; }}});
  const context = {
    request: request({body: JSON.stringify({contributionId: "test-contribution-0002", text: "Привет", channel: "mob"})}),
    response: response(),
    completed: false,
  };

  await handler.handle(context);

  assert.equal(context.response.status, 409);
  assert.equal(context.completed, true);
});

test("leaves unrelated routes for another handler", async () => {
  const handler = new PrincipalContribution({dtoInfoFactory, STAGE, contract, ingress: {accept: async () => assert.fail("must not run")}});
  const context = {request: request({method: "GET", url: "/"}), response: response(), completed: false};

  await handler.handle(context);

  assert.equal(context.completed, false);
  assert.equal(context.response.status, undefined);
});

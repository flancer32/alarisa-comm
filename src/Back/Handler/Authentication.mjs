// @ts-check

/**
 * @namespace Alarisa_Comm_Back_Handler_Authentication
 * @description HTTP adapter for one-Principal WebAuthn ceremonies and opaque server sessions.
 */

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";

async function readBody(request, maxBodyBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(new Error("Request body is too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    request.on("error", reject);
  });
}

function cookieValue(request, name) {
  const source = request.headers.cookie ?? "";
  for (const part of source.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return undefined;
}

function sessionCookie(contract, session) {
  const maxAge = Math.max(0, Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1000));
  return `${contract.cookieName}=${encodeURIComponent(session.token)}; Path=${contract.cookiePath}; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Strict`;
}

function expiredCookie(contract) {
  return `${contract.cookieName}=; Path=${contract.cookiePath}; Max-Age=0; Secure; HttpOnly; SameSite=Strict`;
}

function respondJson(response, status, body, headers = {}) {
  response.writeHead(status, {"Content-Type": JSON_CONTENT_TYPE, "Cache-Control": "no-store", ...headers});
  response.end(JSON.stringify(body));
}

function errorStatus(error) {
  if (["INVALID_INPUT", "INVALID_CHALLENGE"].includes(error?.code)) return 400;
  if (["INVALID_ENROLLMENT", "INVALID_SESSION", "AUTHENTICATION_FAILED", "UNKNOWN_CREDENTIAL", "REVOKED_CREDENTIAL"].includes(error?.code)) return 401;
  if (["EXPIRED_ENROLLMENT", "EXPIRED_CHALLENGE"].includes(error?.code)) return 410;
  if (["NO_CREDENTIALS", "CREDENTIAL_EXISTS", "LAST_CREDENTIAL"].includes(error?.code)) return 409;
  if (error?.code === "STEP_UP_REQUIRED") return 428;
  return 503;
}

export default class Authentication {
  /**
   * @param {object} deps
   * @param {Fl32_Web_Back_Dto_Info__Factory} deps.dtoInfoFactory
   * @param {Fl32_Web_Back_Enum_Stage} deps.STAGE
   * @param {Alarisa_Comm_Contract_Authentication$} deps.contract
   * @param {Alarisa_Back_Auth_Service$} deps.auth
   */
  constructor({dtoInfoFactory, STAGE, contract, auth}) {
    const info = dtoInfoFactory.create({name: "Alarisa_Comm_Back_Handler_Authentication", stage: STAGE.PROCESS});

    this.getRegistrationInfo = function () {
      return info;
    };

    this.handle = async function (context) {
      const {request, response} = context;
      const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
      const routes = contract.routes;
      if (!contract.isAuthenticationRoute(pathname)) return;

      try {
        if (request.method === "POST" && pathname === routes.enrollmentOptions) {
          const payload = await readBody(request, contract.maxBodyBytes);
          respondJson(response, 200, await auth.registrationOptions({token: payload.token}));
        } else if (request.method === "POST" && pathname === routes.enrollmentVerify) {
          const payload = await readBody(request, contract.maxBodyBytes);
          const result = await auth.registrationVerify(payload);
          respondJson(response, 200, {verified: result.verified, credential: result.credential}, {"Set-Cookie": sessionCookie(contract, result.session)});
        } else if (request.method === "POST" && pathname === routes.authenticationOptions) {
          const payload = await readBody(request, contract.maxBodyBytes);
          respondJson(response, 200, await auth.authenticationOptions({surface: payload.surface}));
        } else if (request.method === "POST" && pathname === routes.authenticationVerify) {
          const payload = await readBody(request, contract.maxBodyBytes);
          const result = await auth.authenticationVerify(payload);
          respondJson(response, 200, {verified: result.verified}, {"Set-Cookie": sessionCookie(contract, result.session)});
        } else if (request.method === "GET" && pathname === routes.session) {
          const token = cookieValue(request, contract.cookieName);
          try {
            const session = await auth.resolveSession({token});
            respondJson(response, 200, {
              authenticated: true,
              principalId: session.principalId,
              credentialId: session.credentialId,
              surface: session.surface,
              expiresAt: session.expiresAt,
            });
          } catch (error) {
            if (error?.code !== "INVALID_SESSION" && error?.code !== "REVOKED_CREDENTIAL") throw error;
            respondJson(response, 200, {authenticated: false}, {"Set-Cookie": expiredCookie(contract)});
          }
        } else if (request.method === "POST" && pathname === routes.logout) {
          const token = cookieValue(request, contract.cookieName);
          if (token) await auth.revokeSession({token});
          respondJson(response, 200, {authenticated: false}, {"Set-Cookie": expiredCookie(contract)});
        } else if (request.method === "GET" && pathname === routes.credentials) {
          const token = cookieValue(request, contract.cookieName);
          respondJson(response, 200, {credentials: await auth.listCredentials({token})});
        } else if (request.method === "POST" && pathname === routes.credentialRevoke) {
          const token = cookieValue(request, contract.cookieName);
          const payload = await readBody(request, contract.maxBodyBytes);
          respondJson(response, 200, await auth.revokeCredential({token, credentialId: payload.credentialId}));
        } else {
          respondJson(response, 405, {error: "Method is not allowed for this authentication route"}, {Allow: pathname === routes.session ? "GET" : "POST"});
        }
      } catch (error) {
        const status = errorStatus(error);
        const message = status === 503 ? "Authentication service is unavailable" : error instanceof Error ? error.message : "Authentication request failed";
        respondJson(response, status, {error: message});
      }
      context.completed = true;
    };
  }
}

export const __deps__ = Object.freeze({
  dtoInfoFactory: "Fl32_Web_Back_Dto_Info__Factory$",
  STAGE: "Fl32_Web_Back_Enum_Stage$",
  contract: "Alarisa_Comm_Contract_Authentication$",
  auth: "Alarisa_Back_Auth_Service$",
});

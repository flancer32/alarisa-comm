// @ts-check

/**
 * @namespace Alarisa_Comm_Back_Handler_PrincipalContribution
 * @description Validates the shared Principal-contribution HTTP transport and delegates durable acceptance.
 */

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";

/**
 * @param {Alarisa_Comm_Node_IncomingMessage} request
 * @param {number} maxBodyBytes
 * @returns {Promise<string>}
 */
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
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

/**
 * @param {Alarisa_Comm_Node_ServerResponse} response
 * @param {number} status
 * @param {object} body
 * @returns {void}
 */
function respondJson(response, status, body) {
  response.writeHead(status, {"Content-Type": JSON_CONTENT_TYPE, "Cache-Control": "no-store"});
  response.end(JSON.stringify(body));
}

export default class PrincipalContribution {
  /**
   * @param {object} deps
   * @param {Fl32_Web_Back_Dto_Info__Factory} deps.dtoInfoFactory
   * @param {Fl32_Web_Back_Enum_Stage} deps.STAGE
   * @param {Alarisa_Comm_Contract_PrincipalContribution$} deps.contract
   * @param {{accept: function({contributionId: string, text: string, channel: string}): Promise<{accepted: true, contributionId: string}>}} deps.ingress
   */
  constructor({dtoInfoFactory, STAGE, contract, ingress}) {
    const info = dtoInfoFactory.create({
      name: "Alarisa_Comm_Back_Handler_PrincipalContribution",
      stage: STAGE.PROCESS,
    });

    this.getRegistrationInfo = function () {
      return info;
    };

    this.handle = async function (context) {
      const {request, response} = context;
      const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
      if (request.method !== "POST" || pathname !== contract.route) return;

      const contentType = request.headers["content-type"] ?? "";
      if (!contentType.toLowerCase().startsWith("application/json")) {
        respondJson(response, 415, {accepted: false, error: "Content-Type must be application/json"});
        context.completed = true;
        return;
      }

      let payload;
      try {
        payload = JSON.parse(await readBody(request, contract.maxBodyBytes));
      } catch (error) {
        respondJson(response, 400, {accepted: false, error: error instanceof Error ? error.message : "Invalid JSON"});
        context.completed = true;
        return;
      }

      const contributionId = typeof payload?.contributionId === "string" ? payload.contributionId : "";
      const text = typeof payload?.text === "string" ? payload.text.trim() : "";
      const channel = typeof payload?.channel === "string" ? payload.channel : "";
      if (!contract.contributionIdPattern.test(contributionId)) {
        respondJson(response, 400, {accepted: false, error: "contributionId must contain 16 to 128 URL-safe characters"});
        context.completed = true;
        return;
      }
      if (!text || text.length > contract.maxTextLength) {
        respondJson(response, 400, {accepted: false, error: `text must contain 1 to ${contract.maxTextLength} characters`});
        context.completed = true;
        return;
      }
      if (!contract.channels.includes(channel)) {
        respondJson(response, 400, {accepted: false, error: "channel is not supported"});
        context.completed = true;
        return;
      }

      try {
        const result = await ingress.accept({contributionId, text, channel});
        respondJson(response, 202, result);
      } catch (error) {
        if (error?.code === "CONTRIBUTION_CONFLICT") {
          respondJson(response, 409, {accepted: false, error: error.message});
        } else {
          respondJson(response, 503, {accepted: false, error: "Ingress is unavailable"});
        }
      }
      context.completed = true;
    };
  }
}

export const __deps__ = Object.freeze({
  dtoInfoFactory: "Fl32_Web_Back_Dto_Info__Factory$",
  STAGE: "Fl32_Web_Back_Enum_Stage$",
  contract: "Alarisa_Comm_Contract_PrincipalContribution$",
  ingress: "Alarisa_Back_Ingress_Human$",
});

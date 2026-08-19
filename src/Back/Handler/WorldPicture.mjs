// @ts-check

/**
 * @namespace Alarisa_Comm_Back_Handler_WorldPicture
 * @description Adapts protected versioned World Picture reads to the State-owned read facade.
 */

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";

/**
 * @param {Alarisa_Comm_Node_ServerResponse} response
 * @param {number} status
 * @param {object} body
 * @param {object} headers
 * @returns {void}
 */
function respondJson(response, status, body, headers = {}) {
  response.writeHead(status, {"Content-Type": JSON_CONTENT_TYPE, "Cache-Control": "no-store", ...headers});
  response.end(JSON.stringify(body));
}

export default class WorldPicture {
  /**
   * @param {object} deps
   * @param {TeqFw_Web_Back_Dto_Info__Factory} deps.dtoInfoFactory
   * @param {TeqFw_Web_Back_Enum_Stage} deps.STAGE
   * @param {Alarisa_Comm_Contract_WorldPicture$} deps.contract
   * @param {any} deps.read
   */
  constructor({dtoInfoFactory, STAGE, contract, read}) {
    const info = dtoInfoFactory.create({name: "Alarisa_Comm_Back_Handler_WorldPicture", stage: STAGE.PROCESS});

    /**
     * @returns {TeqFw_Web_Back_Dto_Info}
     */
    this.getRegistrationInfo = function () {
      return info;
    };

    /**
     * @param {any} context
     * @returns {Promise<void>}
     */
    this.handle = async function (context) {
      const {request, response} = context;
      const url = new URL(request.url ?? "/", "http://localhost");
      const route = contract.routeFor(url.pathname);
      if (!route) return;

      if (request.method !== contract.methods.read) {
        respondJson(response, contract.status.methodNotAllowed, {error: contract.errors.methodNotAllowed}, {Allow: contract.methods.read});
        context.completed = true;
        return;
      }

      if (route.kind === "unknown") {
        respondJson(response, contract.status.notFound, {error: contract.errors.notFound});
        context.completed = true;
        return;
      }

      let input;
      /** @type {any} */
      if (route.kind === "tree") {
        const focus = contract.parseOptionalFocus(url.searchParams.getAll(contract.query.focus));
        if (!focus.valid) {
          respondJson(response, contract.status.badRequest, {error: contract.errors.malformedIdentity});
          context.completed = true;
          return;
        }
        input = {focusObjectId: focus.value};
      } else {
        const objectId = contract.parseIdentity(route.rawIdentity);
        if (objectId === undefined) {
          respondJson(response, contract.status.badRequest, {error: contract.errors.malformedIdentity});
          context.completed = true;
          return;
        }
        input = {objectId};
      }

      try {
        const dto = route.kind === "tree" ? await read.tree(input) : await read.node(input);
        respondJson(response, contract.status.ok, dto);
      } catch (error) {
        if (error instanceof Error && error.name === "ReadSelectionError") {
          respondJson(response, contract.status.notFound, {error: contract.errors.notFound});
        } else {
          respondJson(response, contract.status.unavailable, {error: contract.errors.unavailable});
        }
      }
      context.completed = true;
    };
  }
}

export const __deps__ = Object.freeze({
  dtoInfoFactory: "TeqFw_Web_Back_Dto_Info__Factory$",
  STAGE: "TeqFw_Web_Back_Enum_Stage$",
  contract: "Alarisa_Comm_Contract_WorldPicture$",
  read: "Alarisa_Back_State_Service_Read$",
});

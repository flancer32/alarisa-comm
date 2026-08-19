// @ts-check

/**
 * @namespace Alarisa_Comm_Contract_WorldPicture
 * @description Versioned read-only HTTP contract for the current State-owned World Picture.
 */

export default class WorldPicture {
  /**
   * @param {object} options
   */
  constructor(options = {}) {
    void options;
    this.routePrefix = "/api/v1/world-picture";
    this.routes = Object.freeze({
      tree: `${this.routePrefix}/tree`,
      nodePrefix: `${this.routePrefix}/node/`,
    });
    this.methods = Object.freeze({read: "GET"});
    this.query = Object.freeze({focus: "focus"});
    this.identityPattern = /^[1-9][0-9]*$/;
    this.status = Object.freeze({ok: 200, badRequest: 400, notFound: 404, methodNotAllowed: 405, unavailable: 503});
    this.errors = Object.freeze({
      malformedIdentity: "World Picture identity must be a positive decimal State identity",
      notFound: "World Picture selection was not found",
      methodNotAllowed: "Method is not allowed for this World Picture route",
      unavailable: "World Picture is temporarily unavailable",
    });

    /**
     * @param {string} pathname
     * @returns {Alarisa_Comm_Contract_WorldPicture_Route|undefined}
     */
    this.routeFor = function (pathname) {
      if (pathname === this.routes.tree) return {kind: "tree", rawIdentity: ""};
      if (pathname.startsWith(this.routes.nodePrefix)) return {kind: "node", rawIdentity: pathname.slice(this.routes.nodePrefix.length)};
      if (pathname === this.routePrefix || pathname.startsWith(`${this.routePrefix}/`)) return {kind: "unknown", rawIdentity: ""};
      return undefined;
    };

    /**
     * @param {string} rawIdentity
     * @returns {number|undefined}
     */
    this.parseIdentity = function (rawIdentity) {
      if (!this.identityPattern.test(rawIdentity)) return undefined;
      const identity = Number(rawIdentity);
      return Number.isSafeInteger(identity) && identity > 0 ? identity : undefined;
    };

    /**
     * @param {string[]} values
     * @returns {Alarisa_Comm_Contract_WorldPicture_Focus}
     */
    this.parseOptionalFocus = function (values) {
      if (!values.length) return {valid: true, value: undefined};
      if (values.length !== 1) return {valid: false, value: undefined};
      const value = this.parseIdentity(values[0]);
      return value === undefined ? {valid: false, value: undefined} : {valid: true, value};
    };
    Object.freeze(this);
  }
}

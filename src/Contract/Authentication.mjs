// @ts-check

/**
 * @namespace Alarisa_Comm_Contract_Authentication
 * @description Shared one-Principal authentication routes, cookie name, limits, and surfaces.
 */

export default class Authentication {
  constructor() {
    this.routes = Object.freeze({
      enrollmentOptions: "/api/v1/auth/enrollment/options",
      enrollmentVerify: "/api/v1/auth/enrollment/verify",
      authenticationOptions: "/api/v1/auth/authentication/options",
      authenticationVerify: "/api/v1/auth/authentication/verify",
      session: "/api/v1/auth/session",
      logout: "/api/v1/auth/logout",
      credentials: "/api/v1/auth/credentials",
      credentialRevoke: "/api/v1/auth/credentials/revoke",
    });
    this.cookieName = "alarisa_session";
    this.cookiePath = "/api/v1/";
    this.maxBodyBytes = 65_536;
    this.surfaces = Object.freeze(["desk", "mob"]);
    this.isAuthenticationRoute = (pathname) => Object.values(this.routes).includes(pathname);
    Object.freeze(this);
  }
}

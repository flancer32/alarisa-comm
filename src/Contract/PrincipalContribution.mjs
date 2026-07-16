// @ts-check

/**
 * @namespace Alarisa_Comm_Contract_PrincipalContribution
 * @description Shared versioned transport constants for Principal contributions.
 */

export default class PrincipalContribution {
  constructor() {
    this.route = "/api/v1/ingress/human";
    this.maxBodyBytes = 8192;
    this.maxTextLength = 4000;
    this.contributionIdPattern = /^[A-Za-z0-9_-]{16,128}$/;
    this.channels = Object.freeze(["desk", "mob", "android", "ios"]);
    Object.freeze(this);
  }
}

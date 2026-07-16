// @ts-check

/**
 * @namespace Alarisa_Comm_Contract_PrincipalContribution
 * @description Shared versioned transport constants for Principal contributions.
 */

export default Object.freeze({
  route: "/api/v1/ingress/human",
  maxBodyBytes: 8192,
  maxTextLength: 4000,
  contributionIdPattern: /^[A-Za-z0-9_-]{16,128}$/,
  channels: Object.freeze(["desk", "mob", "android", "ios"]),
});

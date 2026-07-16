const routes = Object.freeze({
  enrollmentOptions: '/api/v1/auth/enrollment/options',
  enrollmentVerify: '/api/v1/auth/enrollment/verify',
  authenticationOptions: '/api/v1/auth/authentication/options',
  authenticationVerify: '/api/v1/auth/authentication/verify',
  session: '/api/v1/auth/session',
  logout: '/api/v1/auth/logout',
});

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeBase64Url(value) {
  if (value === null || value === undefined) return null;
  const bytes = new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: options.body ? {'Content-Type': 'application/json', ...(options.headers ?? {})} : options.headers,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed with status ${response.status}`);
  return body;
}

function creationOptions(options) {
  return {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    user: {...options.user, id: decodeBase64Url(options.user.id)},
    excludeCredentials: (options.excludeCredentials ?? []).map((credential) => ({...credential, id: decodeBase64Url(credential.id)})),
  };
}

function requestOptions(options) {
  return {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    allowCredentials: (options.allowCredentials ?? []).map((credential) => ({...credential, id: decodeBase64Url(credential.id)})),
  };
}

function registrationResponse(credential) {
  const response = credential.response;
  return {
    id: credential.id,
    rawId: encodeBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: encodeBase64Url(response.clientDataJSON),
      attestationObject: encodeBase64Url(response.attestationObject),
      transports: typeof response.getTransports === 'function' ? response.getTransports() : [],
      publicKey: typeof response.getPublicKey === 'function' ? encodeBase64Url(response.getPublicKey()) : undefined,
      publicKeyAlgorithm: typeof response.getPublicKeyAlgorithm === 'function' ? response.getPublicKeyAlgorithm() : undefined,
    },
  };
}

function authenticationResponse(credential) {
  const response = credential.response;
  return {
    id: credential.id,
    rawId: encodeBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      authenticatorData: encodeBase64Url(response.authenticatorData),
      clientDataJSON: encodeBase64Url(response.clientDataJSON),
      signature: encodeBase64Url(response.signature),
      userHandle: encodeBase64Url(response.userHandle),
    },
  };
}

export async function currentSession() {
  return jsonRequest(routes.session);
}

export async function registerAuthenticator(token) {
  if (!window.PublicKeyCredential) throw new Error('Этот браузер не поддерживает passkeys.');
  const ceremony = await jsonRequest(routes.enrollmentOptions, {method: 'POST', body: JSON.stringify({token})});
  const credential = await navigator.credentials.create({publicKey: creationOptions(ceremony.options)});
  if (!credential) throw new Error('Регистрация passkey была отменена.');
  return jsonRequest(routes.enrollmentVerify, {
    method: 'POST',
    body: JSON.stringify({ceremonyId: ceremony.ceremonyId, token, response: registrationResponse(credential)}),
  });
}

export async function authenticate(surface) {
  if (!window.PublicKeyCredential) throw new Error('Этот браузер не поддерживает passkeys.');
  const ceremony = await jsonRequest(routes.authenticationOptions, {method: 'POST', body: JSON.stringify({surface})});
  const credential = await navigator.credentials.get({publicKey: requestOptions(ceremony.options)});
  if (!credential) throw new Error('Вход с passkey был отменён.');
  return jsonRequest(routes.authenticationVerify, {
    method: 'POST',
    body: JSON.stringify({ceremonyId: ceremony.ceremonyId, surface, response: authenticationResponse(credential)}),
  });
}

export async function logout() {
  return jsonRequest(routes.logout, {method: 'POST'});
}

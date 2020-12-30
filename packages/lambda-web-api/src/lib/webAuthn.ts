import * as crypto from "crypto";
import base64url from "base64url";
import * as jwkToPem from "jwk-to-pem";
import * as cbor from "cbor";

/**
 * Spec for https://www.w3.org/TR/webauthn
 */

type ClientData = {
  challenge: string;
  origin: string;
  type: string;
};
type AuthData = {
  rpIdHash: Buffer;
  flags: number;
  signCount: number;
  aaguid: Buffer;
  credentialId: Buffer;
  credentialPublicKey: Buffer;
};

/**
 * @see https://www.w3.org/TR/webauthn/#sctn-cryptographic-challenges
 */
export function createChallenge() {
  const challenge = crypto
    .randomBytes(128)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=*$/g, "");
  return challenge;
}

/**
 * @see Step.5 and .6  of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
 * @see Step.9 and .10 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
 * @see https://www.w3.org/TR/webauthn/#dom-authenticatorresponse-clientdatajson
 * @see https://www.w3.org/TR/webauthn/#client-data
 */
export function getClientAuth(clientDataJSON: string): ClientData {
  return JSON.parse(base64url.decode(clientDataJSON)) as ClientData;
}

/**
 * @see Step.9  of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
 * @see Step.13 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
 * @see https://www.w3.org/TR/webauthn/#dom-collectedclientdata-origin
 */
export function verifyOrigin(
  allowOrigins: string,
  clientData: ClientData
): void {
  if (!allowOrigins.split(",").includes(clientData.origin)) {
    throw new Error(
      `clientData.origin is invalid. clientData.origin: ${clientData.origin} ALLOW_ORIGINS: ${allowOrigins}`
    );
  }
}

/**
 * @see Step.13 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
 * @see Step.15 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
 * @see https://www.w3.org/TR/webauthn/#rpidhash
 */
export function verifyRpIdHash(authData: AuthData, rpId: string) {
  if (hash(rpId).equals(Buffer.from(authData.rpIdHash)) === false) {
    throw new Error(
      `rpIdHash is unmatch. authDataStruct.rpIdHash: ${authData.rpIdHash}`
    );
  }
}

/**
 * @see Step.14 and .15 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
 * @see Step.16 and .17 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
 * @see https://www.w3.org/TR/webauthn/#flags
 */
export function verifyFlag(authData: AuthData) {
  // Flags UP の一致を確認
  if (Boolean(authData.flags & 0x01) === false) {
    throw new Error("Flags UP is unmatch.");
  }
  // Flags UV の一致を確認
  if (Boolean(authData.flags & 0x04) === false) {
    throw new Error("Flags UV is unmatch.");
  }
}

/**
 * @see Step.16 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
 * @see https://www.w3.org/TR/webauthn/#dom-publickeycredentialparameters-alg
 */
export function verifyAlg(alg: number) {
  if (alg !== -7) {
    throw new Error("Incorrect Alg in credentialPublicKey.");
  }
}

/**
 * @see Step.18 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
 * @see https://www.w3.org/TR/webauthn/#sctn-packed-attestation
 */
export function verifyFmt(fmt: string, attStmt: Object) {
  // for only Packed without x5c (横着)
  if (fmt !== "packed") {
    throw new Error(`Unsupported attestation format. fmt: ${fmt}`);
  }
  if (attStmt.hasOwnProperty("x5c")) {
    throw new Error("Unsupported attStmt that has x5c.");
  }
}

/**
 * @see Step.19 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
 * @see https://www.w3.org/TR/webauthn/#sctn-packed-attestation
 */
export function verifyAttStmt(
  attStmt: { sig: Buffer; alg: number },
  alg: number
) {
  if (attStmt.alg !== alg) {
    throw new Error(
      `Incorrect Signature. ${{ "attStmt.alg": attStmt.alg, alg }}`
    );
  }
}

/**
 * @see Step.19 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
 * @see https://www.w3.org/TR/webauthn/#sctn-packed-attestation
 */
export function verifySignature(
  signature: Buffer,
  jwk: jwkToPem.JWK,
  authData: Buffer,
  clientDataHash: Buffer
) {
  const pem = jwkToPem(jwk);
  const result = crypto
    .createVerify("SHA256")
    .update(authData)
    .update(clientDataHash)
    .verify(pem, signature);

  if (!result) {
    throw new Error("Incorrect Signature.");
  }
}

/**
 * @see Step.11 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
 */
export function hashClientData(clientDataJSON: string) {
  return hash(base64url.toBuffer(clientDataJSON));
}

/**
 * @see Step.12 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
 */
export function getAttestationObject(attestationObject: string) {
  const decoded = cbor.decode(base64url.toBuffer(attestationObject));
  // cast
  const fmt: string = decoded.fmt;
  const authData: Buffer = decoded.authData;
  const attStmt: Object = decoded.attStmt;
  return { fmt, authData, attStmt };
}

/**
 * Parses authenticatorData buffer.
 * @see https://www.w3.org/TR/webauthn/#fig-attStructs
 * @see https://www.w3.org/TR/webauthn/#authenticator-data
 * @param authData - authData in attestationObject
 * @return         - parsed authenticatorData struct
 */
export const parseAuthData = (authData: Buffer): AuthData => {
  const rpIdHash = authData.slice(0, 32);
  const flags = authData[32];
  const signCount =
    (authData[33] << 24) |
    (authData[34] << 16) |
    (authData[35] << 8) |
    authData[36];
  const aaguid = authData.slice(37, 53);
  const credentialIdLength = (authData[53] << 8) + authData[54];
  const credentialId = authData.slice(55, 55 + credentialIdLength);
  const credentialPublicKey = authData.slice(55 + credentialIdLength);

  return {
    rpIdHash,
    flags,
    signCount,
    aaguid,
    credentialId,
    credentialPublicKey,
  };
};

/**
 * @see https://www.w3.org/TR/webauthn/#credentialpublickey
 */
export function getAlgFromPublicKey(publicKeyCbor: any) {
  return publicKeyCbor.get(3);
}

/**
 * Returns SHA-256 digest of the given data.
 * @param data - data to hash
 * @return     - the hash
 */
const hash = (data: crypto.BinaryLike): Buffer => {
  return crypto.createHash("SHA256").update(data).digest();
};

import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import * as crypto from "crypto";
import base64url from "base64url";
import * as Yup from "yup";
import * as cbor from "cbor";
import * as jwkToPem from "jwk-to-pem";
import { getSignUpChallenge, putCredential } from "./db";

type Event = Pick<APIGatewayProxyEventV2, "body">;
type Credential = {
  id: string;
  response: { attestationObject: string; clientDataJSON: string };
};
type ClientData = {
  challenge: string;
  origin: string;
  type: "webauthn.create";
};
type AuthData = {
  rpIdHash: Buffer;
  flags: number;
  signCount: number;
  aaguid: Buffer;
  credentialId: Buffer;
  credentialPublicKey: Buffer;
};

const eventSchema = Yup.object()
  .required()
  .shape({ body: Yup.string().required() });
const bodySchema = Yup.object()
  .required()
  .shape({
    username: Yup.string().required(),
    credential: Yup.object()
      .required()
      .shape({
        id: Yup.string().required(),
        response: Yup.object().required().shape({
          attestationObject: Yup.string().required(),
          clientDataJSON: Yup.string().required(),
        }),
      }),
  });
const clientDataSchema = Yup.object()
  .required()
  .shape({
    challenge: Yup.string().required(),
    origin: Yup.string().required(),
    type: Yup.string().required().equals(["webauthn.create"]),
  });

/**
 * Sign Up 処理
 *
 * @param event
 */
export default async function signUpChallenge(
  event: Event,
  now: Date
): Promise<APIGatewayProxyStructuredResultV2> {
  const { ALLOW_ORIGINS, RP_ID } = process.env;
  if (!ALLOW_ORIGINS) {
    throw new Error("Enviroment variable `ALLOW_ORIGINS` is required.");
  }
  if (!RP_ID) {
    throw new Error("Enviroment variable `RP_ID` is required.");
  }
  console.info({ ALLOW_ORIGINS, RP_ID });

  const validatedEvent = await validateEvent(event);
  if (validatedEvent.hasError) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: validatedEvent.error.message }),
    };
  }

  const { username, credential } = validatedEvent.value.body;
  console.info({ username, credential });

  // Step.5 and .6 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
  const clientData = await getClientAuth(credential.response.clientDataJSON);
  console.info({ clientData });

  try {
    // Step.7 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    verifyType(clientData);
    // Step.8 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    await verifyChallenge(username, clientData);
    // Step.9 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    verifyOrigin(ALLOW_ORIGINS, clientData);
  } catch (error) {
    console.error(error);
    // give no hint to client
    return { statusCode: 400, body: "Invalid clientDataJSON." };
  }

  // skip Step.10 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential

  // Step.11 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
  const clientDataHash = hashClientData(credential);

  // Step.12 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
  const { fmt, authData, attStmt } = getAttestationObject(credential);
  console.info({ fmt, authData, attStmt });

  const authDataStruct = parseAuthData(authData);
  console.info({ authDataStruct });

  const publicKeyCbor: Map<any, any> = cbor.decode(
    authDataStruct.credentialPublicKey
  );
  console.info({ publicKeyCbor });
  const publicKeyJwk = coseToJwk(publicKeyCbor);
  console.info({ publicKeyJwk });

  try {
    // Step.13 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    verifyRpIdHash(authDataStruct, RP_ID);
    // Step.14 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    // Step.15 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    verifyFlag(authDataStruct);
    // Step.16 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    const alg = getAlgFromPublicKey(publicKeyCbor);
    verifyAlg(alg);

    // skip Step.17 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential

    // Step.18 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    verifyFmt(fmt, attStmt);
    const attStmtForPackedWithoutX5c = attStmt as { sig: Buffer; alg: number };
    // Step.19 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    // for only Packed without x5c (横着)
    verifyAttStmt(attStmtForPackedWithoutX5c, alg);
    verifySignature(
      attStmtForPackedWithoutX5c.sig,
      publicKeyJwk,
      authData,
      clientDataHash
    );
  } catch (error) {
    console.error(error);
    return { statusCode: 400, body: "Invalid attestationObject." };
  }

  // Step.22 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
  // credential.id の一意性の保証。他のサンプルでも実装されていない。。。なんでだろう。
  // やるならcredentialのdynamodbへの登録のkeyをpもsも `credential:${credential.id}` にする。userのcredential一覧はGSIからとる。

  // Step.23 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
  await putCredential(
    username,
    credential.id,
    publicKeyJwk,
    authDataStruct.signCount,
    now
  );

  return {
    statusCode: 201,
    body: JSON.stringify({
      // TODO:
    }),
  };
}

type Container<T> =
  | { hasError: false; value: T }
  | { hasError: true; error: Error };

async function validateEvent(
  event: any
): Promise<Container<{ body: { username: string; credential: Credential } }>> {
  try {
    const validEvent = await eventSchema.validate(event);
    const body = await bodySchema.validate(JSON.parse(validEvent.body));
    return { hasError: false, value: { body } };
  } catch (error) {
    return { hasError: true, error };
  }
}

/**
 * Yupでvalidateするけど、余計かな。方が欲しいだけだけど as を使うのが正しいのか。
 */
function getClientAuth(clientDataJSON: string): Promise<ClientData> {
  return clientDataSchema.validate(
    JSON.parse(base64url.decode(clientDataJSON))
  );
}

function verifyType(clientData: ClientData): void {
  if (clientData.type !== "webauthn.create") {
    throw new Error(
      `clientData.type is invalid. clientData.type: ${clientData.type}`
    );
  }
}

async function verifyChallenge(
  username: string,
  clientData: ClientData
): Promise<void> {
  const challenge = await getSignUpChallenge(username, clientData.challenge);
  if (!challenge) {
    throw new Error(
      `No challenge has found. username: ${username} challenge: ${clientData.challenge}`
    );
  }
}

function verifyOrigin(allowOrigins: string, clientData: ClientData): void {
  if (!allowOrigins.split(",").includes(clientData.origin)) {
    throw new Error(
      `clientData.origin is invalid. clientData.origin: ${clientData.origin} ALLOW_ORIGINS: ${allowOrigins}`
    );
  }
}

function verifyRpIdHash(authData: AuthData, rpId: string) {
  if (hash(rpId).equals(Buffer.from(authData.rpIdHash)) === false) {
    throw new Error(
      `rpIdHash is unmatch. authDataStruct.rpIdHash: ${authData.rpIdHash}`
    );
  }
}

function verifyFlag(authData: AuthData) {
  // Flags UP の一致を確認
  if (Boolean(authData.flags & 0x01) === false) {
    throw new Error("Flags UP is unmatch.");
  }
  // Flags UV の一致を確認
  if (Boolean(authData.flags & 0x04) === false) {
    throw new Error("Flags UV is unmatch.");
  }
}

function verifyAlg(alg: number) {
  if (alg !== -7) {
    throw new Error("Incorrect Alg in credentialPublicKey.");
  }
}

function verifyFmt(fmt: string, attStmt: Object) {
  // for only Packed without x5c (横着)
  if (fmt !== "packed") {
    throw new Error(`Unsupported attestation format. fmt: ${fmt}`);
  }
  if (attStmt.hasOwnProperty("x5c")) {
    throw new Error("Unsupported attStmt that has x5c.");
  }
}

function verifyAttStmt(attStmt: { sig: Buffer; alg: number }, alg: number) {
  if (attStmt.alg !== alg) {
    throw new Error(
      `Incorrect Signature. ${{ "attStmt.alg": attStmt.alg, alg }}`
    );
  }
}

function verifySignature(
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

function hashClientData(credential: Credential) {
  return hash(base64url.toBuffer(credential.response.clientDataJSON));
}

function getAttestationObject(credential: Credential) {
  const attestationObject = cbor.decode(
    base64url.toBuffer(credential.response.attestationObject)
  );
  // cast
  const fmt: string = attestationObject.fmt;
  const authData: Buffer = attestationObject.authData;
  const attStmt: Object = attestationObject.attStmt;
  return { fmt, authData, attStmt };
}

/**
 * Parses authenticatorData buffer.
 * @see https://www.w3.org/TR/webauthn/#fig-attStructs
 * @param authData - authData in attestationObject
 * @return         - parsed authenticatorData struct
 */
const parseAuthData = (authData: Buffer): AuthData => {
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
 * Returns SHA-256 digest of the given data.
 * @param data - data to hash
 * @return     - the hash
 */
const hash = (data: crypto.BinaryLike): Buffer => {
  return crypto.createHash("SHA256").update(data).digest();
};

function getAlgFromPublicKey(publicKeyCbor: any) {
  return publicKeyCbor.get(3);
}

/**
 * support only EC
 * @param cose
 */
const coseToJwk = (publicKeyCbor: Map<any, any>) => {
  return {
    kty: "EC",
    crv: "P-256",
    x: base64url(publicKeyCbor.get(-2)),
    y: base64url(publicKeyCbor.get(-3)),
  } as const;
};

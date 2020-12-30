import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import * as crypto from "crypto";
import base64url from "base64url";
import * as Yup from "yup";
import * as jwkToPem from "jwk-to-pem";
import { getSignInChallenge, getCredential, putCredential } from "./db";

type Event = Pick<APIGatewayProxyEventV2, "body">;
type Credential = {
  id: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
  };
};
type ClientData = {
  challenge: string;
  origin: string;
  type: "webauthn.get";
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
          authenticatorData: Yup.string().required(),
          clientDataJSON: Yup.string().required(),
          signature: Yup.string().required(),
        }),
      }),
  });

/**
 * Sign In 処理
 *
 * @param event
 */
export default async function signIn(
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

  // Step.5 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
  // TODO: If options.allowCredentials is not empty, verify that credential.id identifies one of the public key credentials listed in options.allowCredentials.

  // Step.6 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
  // TODO:

  // Step.8 and Step.9 and .10 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
  const authData = base64url.toBuffer(credential.response.authenticatorData);
  const signature = base64url.toBuffer(credential.response.signature);
  const clientData = getClientAuth(credential.response.clientDataJSON);
  console.info({ clientData });

  try {
    // Step.11 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    verifyType(clientData);
    // Step.12 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    await verifyChallenge(username, clientData);
    // Step.13 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    verifyOrigin(ALLOW_ORIGINS, clientData);

    // skip Step.14 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
  } catch (error) {
    console.error(error);
    // give no hint to client
    return { statusCode: 400, body: "Invalid clientDataJSON." };
  }

  const authDataStruct = parseAuthData(authData);
  console.info({ authDataStruct });

  const registeredCredential = await getCredential(username, credential.id);
  if (!registeredCredential) {
    throw new Error("No credential is found.");
  }
  const { jwk, signCount } = registeredCredential;

  try {
    // Step.15 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    verifyRpIdHash(authDataStruct, RP_ID);
    // Step.16 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    // Step.17 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    verifyFlag(authDataStruct);

    // Skip Step.18 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion

    // Step.19 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    const clientDataHash = hashClientData(credential);
    // Step.20 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    verifySignature(signature, jwk, authData, clientDataHash);

    if (signCount >= authDataStruct.signCount) {
      throw new Error(
        "signCount should be more than registered. signCount: ${} authDataStruct.signCount: ${authDataStruct.signCount}"
      );
    }
  } catch (error) {
    console.error(error);
    return { statusCode: 400, body: "Invalid authenticatorData." };
  }

  // Step.21 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
  await putCredential(
    username,
    credential.id,
    jwk,
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

function getClientAuth(clientDataJSON: string): ClientData {
  return JSON.parse(base64url.decode(clientDataJSON)) as ClientData;
}

function verifyType(clientData: ClientData): void {
  if (clientData.type !== "webauthn.get") {
    throw new Error(
      `clientData.type is invalid. clientData.type: ${clientData.type}`
    );
  }
}

async function verifyChallenge(
  username: string,
  clientData: ClientData
): Promise<void> {
  const challenge = await getSignInChallenge(username, clientData.challenge);
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

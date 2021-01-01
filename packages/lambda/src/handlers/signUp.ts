import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import base64url from "base64url";
import * as z from "zod";
import * as cbor from "cbor";
import { getSignUpChallenge, putCredential } from "../lib/db";
import {
  getClientAuth,
  verifyOrigin,
  verifyRpIdHash,
  verifyFlag,
  verifyAlg,
  verifyFmt,
  verifyAttStmt,
  verifySignature,
  hashClientData,
  getAttestationObject,
  parseAuthData,
  getAlgFromPublicKey,
} from "../lib/webAuthn";

type Event = Pick<APIGatewayProxyEventV2, "body">;

const eventSchema = z.object({ body: z.string() }).nonstrict();
const bodySchema = z.object({
  username: z.string(),
  credential: z
    .object({
      id: z.string(),
      response: z
        .object({
          attestationObject: z.string(),
          clientDataJSON: z.string(),
        })
        .nonstrict(),
    })
    .nonstrict(),
});

/**
 * Sign Up 処理
 *
 * @param event
 */
export default async function signUp(
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
  if (!validatedEvent.success) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: validatedEvent.error.message }),
    };
  }

  const { username, credential } = validatedEvent.data;
  console.info({ username, credential });

  // Step.5 and .6 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
  const clientData = getClientAuth(credential.response.clientDataJSON);
  console.info({ clientData });

  try {
    // Step.7 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    verifyType(clientData.type);
    // Step.8 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    await verifyChallenge(username, clientData.challenge);
    // Step.9 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
    verifyOrigin(ALLOW_ORIGINS, clientData);

    // skip Step.10 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
  } catch (error) {
    console.error(error);
    // give no hint to client
    return { statusCode: 400, body: "Invalid clientDataJSON." };
  }

  // Step.11 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
  const clientDataHash = hashClientData(credential.response.clientDataJSON);

  // Step.12 of https://www.w3.org/TR/webauthn/#sctn-registering-a-new-credential
  const { fmt, authData, attStmt } = getAttestationObject(
    credential.response.attestationObject
  );
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

async function validateEvent(event: any) {
  const validatedEvent = eventSchema.safeParse(event);
  if (!validatedEvent.success) {
    return validatedEvent;
  }
  return bodySchema.safeParse(JSON.parse(validatedEvent.data.body));
}

async function verifyChallenge(
  username: string,
  challenge: string
): Promise<void> {
  const result = await getSignUpChallenge(username, challenge);
  if (!result) {
    throw new Error(
      `No challenge has found. username: ${username} challenge: ${challenge}`
    );
  }
}

export function verifyType(type: string): void {
  if (type !== "webauthn.create") {
    throw new Error(`clientData.type is invalid. clientData.type: ${type}`);
  }
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

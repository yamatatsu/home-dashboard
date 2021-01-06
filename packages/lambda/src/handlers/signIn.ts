import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import base64url from "base64url";
import * as z from "zod";
import * as cookie from "cookie";
import { v4 as uuid } from "uuid";
import { getGetSignInChallengeInput } from "../models/challenge";
import {
  getGetCredentialInput,
  getPutCredentialInput,
} from "../models/credential";
import { getPutSessionInput } from "../models/session";
import { AuthTableClient } from "../lib/awsSdk";
import {
  getClientAuth,
  verifyOrigin,
  verifyRpIdHash,
  verifyFlag,
  verifySignature,
  hashClientData,
  parseAuthData,
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
          authenticatorData: z.string(),
          clientDataJSON: z.string(),
          signature: z.string(),
        })
        .nonstrict(),
    })
    .nonstrict(),
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

  const validatedEvent = validateEvent(event);
  if (!validatedEvent.success) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: validatedEvent.error.message }),
    };
  }

  const { username, credential } = validatedEvent.data;
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
    verifyType(clientData.type);
    // Step.12 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    await verifyChallenge(username, clientData.challenge);
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

  const registeredCredential = await AuthTableClient.get(
    getGetCredentialInput(username, credential.id)
  );
  if (!registeredCredential.Item) {
    throw new Error("No credential is found.");
  }
  if (!registeredCredential.Item.approved) {
    console.info("This device is not approved yet. %o", registeredCredential);
    return { statusCode: 401, body: "Your device is not approved yet." };
  }
  const { jwk, signCount } = registeredCredential.Item;

  try {
    // Step.15 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    verifyRpIdHash(authDataStruct, RP_ID);
    // Step.16 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    // Step.17 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    verifyFlag(authDataStruct);

    // Skip Step.18 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion

    // Step.19 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    const clientDataHash = hashClientData(credential.response.clientDataJSON);
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
  await AuthTableClient.put(
    getPutCredentialInput(
      username,
      credential.id,
      jwk,
      authDataStruct.signCount,
      now
    )
  );

  const sessionId = uuid();
  await AuthTableClient.put(getPutSessionInput(sessionId, username, now));

  const dev = ALLOW_ORIGINS.split(",").some((s) =>
    s.startsWith("http://localhost")
  );
  return {
    statusCode: 201,
    body: JSON.stringify({ sessionId }),
    cookies: [
      cookie.serialize("sessionId", sessionId, {
        httpOnly: true,
        maxAge: 12 * 60 * 60, // sec
        sameSite: dev ? "none" : "strict",
        secure: true,
      }),
    ],
  };
}

function validateEvent(event: any) {
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
  const result = await AuthTableClient.get(
    getGetSignInChallengeInput(username, challenge)
  );
  if (!result.Item) {
    throw new Error(
      `No challenge has found. username: ${username} challenge: ${challenge}`
    );
  }
}

export function verifyType(type: string): void {
  if (type !== "webauthn.get") {
    throw new Error(`clientData.type is invalid. clientData.type: ${type}`);
  }
}

import { v4 as uuid } from "uuid";
import { JWK } from "jwk-to-pem";
import { Session } from "./session";
import { getSession } from "./sessionRepository";
import { getSignUpChallenge, getSignInChallenge } from "./challengeRepository";
import {
  getCredential as _getCredential,
  putCredential,
} from "./credentialRepository";
import { createCredential, Credential } from "./credential";
import { createSession } from "./session";
import { putSession } from "./sessionRepository";

export async function verifySignUpChallenge(
  username: string,
  challenge: string
): Promise<void> {
  const item = await getSignUpChallenge(username, challenge);
  if (!item) {
    throw new Error(
      `No challenge has found. username: ${username} challenge: ${challenge}`
    );
  }
}

export async function verifySignInChallenge(
  username: string,
  challenge: string
): Promise<void> {
  const item = await getSignInChallenge(username, challenge);
  if (!item) {
    throw new Error(
      `No challenge has found. username: ${username} challenge: ${challenge}`
    );
  }
}

export async function signIn(
  username: string,
  credentialId: string,
  jwk: JWK,
  signCount: number,
  now: Date
): Promise<string> {
  await putCredential(
    createCredential(username, credentialId, jwk, signCount, now, true)
  );

  const sessionId = uuid();
  await putSession(createSession(sessionId, username, now));

  return sessionId;
}

export async function authorize(
  sessionId: string | undefined
): Promise<Session | null> {
  console.info("sessionId: ", sessionId);

  if (!sessionId) {
    console.info("sessionId is empty.");
    return null;
  }
  const session = await getSession(sessionId);
  if (!session) {
    console.info("No session has found.");
    return null;
  }
  return session;
}

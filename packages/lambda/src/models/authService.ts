import { v4 as uuid } from "uuid";
import { JWK } from "jwk-to-pem";
import { getSignUpChallenge, getSignInChallenge } from "./challengeRepository";
import {
  getCredential as _getCredential,
  putCredential,
} from "./credentialRepository";
import { createCredential } from "./credential";
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

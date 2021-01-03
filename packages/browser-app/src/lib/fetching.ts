import * as Yup from "yup";
import {
  SIGN_UP_CHALLENGE_URL,
  SIGN_UP_URL,
  SIGN_IN_CHALLENGE_URL,
  SIGN_IN_URL,
  REMO_EVENTS_URL,
} from "../constants";

export async function fetchSignUpChallenge(username: string): Promise<string> {
  const response = await fetch(SIGN_UP_CHALLENGE_URL, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!response.ok) {
    throw new Error("fetchSignUpChallenge response is error.");
  }
  const json = await response.json();

  return Yup.string().required().validate(json.challenge);
}

export async function fetchSignUp(decodedCredential: Record<string, any>) {
  const response = await fetch(SIGN_UP_URL, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(decodedCredential),
  });
  if (!response.ok) {
    throw new Error("fetchSignUp response is error.");
  }
  const json = await response.json();

  return json;
}

export async function fetchSignInChallenge(
  username: string
): Promise<{ challenge: string; credentialIds: string[] }> {
  const response = await fetch(SIGN_IN_CHALLENGE_URL, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!response.ok) {
    throw new Error("fetchSignInChallenge response is error.");
  }
  const json = await response.json();

  const scheme = Yup.object()
    .required()
    .shape({
      challenge: Yup.string().required(),
      credentialIds: Yup.array().of(Yup.string().required()).required(),
    });

  return scheme.validate(json);
}

export async function fetchSignIn(
  decodedCredential: Record<string, any>
): Promise<{ challenge: string; credentialIds: string[] }> {
  const response = await fetch(SIGN_IN_URL, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(decodedCredential),
  });
  if (!response.ok) {
    throw new Error("fetchSignIn response is error.");
  }
  const json = await response.json();

  return json;
}

export async function fetchGetRemoEvents(): Promise<any> {
  const response = await fetch(REMO_EVENTS_URL, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("fetchSignIn response is error.");
  }
  const json = await response.json();
  return json;
}

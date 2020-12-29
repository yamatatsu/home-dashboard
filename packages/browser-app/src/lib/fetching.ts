import * as Yup from "yup";
import { SIGN_UP_CHALLENGE_URL, SIGN_UP_URL } from "../constants";

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

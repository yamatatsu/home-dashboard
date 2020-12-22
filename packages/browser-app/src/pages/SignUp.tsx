import React, { FC } from "react";
import { useGoToSignIn } from "../routes";
import { RedirectIfSignedIn } from "../componrnts/RedirectIfSignedIn";
import { CHALLENGE_URL } from "../constants";

export const SignUp: FC = () => {
  const goToSignIn = useGoToSignIn();

  return (
    <RedirectIfSignedIn>
      <h2>Sign Up</h2>

      <div>
        <button
          type="button"
          onClick={() => {
            signUp()
              .then(() => {
                goToSignIn();
              })
              .catch((err) => {
                console.error(err);
              });
          }}
        >
          Sign Up
        </button>
      </div>
    </RedirectIfSignedIn>
  );
};

async function signUp() {
  const response = await fetch(CHALLENGE_URL);
  const json = await response.json();
  const challenge = json.challenge;
  if (!challenge || typeof challenge !== "string") {
    throw new Error(`challenge should be string.`);
  }

  const res = await navigator.credentials.create({
    publicKey: {
      attestation: "none",
      authenticatorSelection: {
        // authenticatorAttachment: AuthenticatorAttachment,
        requireResidentKey: false,
        userVerification: "preferred",
      },
      challenge: new TextEncoder().encode(challenge),
      // excludeCredentials?: PublicKeyCredentialDescriptor[],
      // extensions?: AuthenticationExtensionsClientInputs,
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],
      rp: { name: "Yamatatsu Home Dashboard" },
      // timeout?: number,
      user: {
        id: new TextEncoder().encode("dummy-username"),
        name: "dummy-username",
        displayName: "Dummy taro",
        // icon?: string,
      },
    },
    // signal?: AbortSignal,
  });

  console.log(res);
  return res;
}

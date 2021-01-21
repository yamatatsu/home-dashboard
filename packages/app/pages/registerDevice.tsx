import React from "react";
import { NextPage } from "next";
import { useGoToLogin } from "../lib/routes";
import { fetchSignUp, fetchSignUpChallenge } from "../lib/fetching";
import { createCredentials } from "../lib/WebAuthn";

const Page: NextPage = () => {
  const goToLogin = useGoToLogin();

  const handleClickRegister = () => {
    signUp("aa")
      .then(() => {
        goToLogin();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <>
      <h2>Register Device</h2>
      <div>
        <button type="button" onClick={handleClickRegister}>
          Register
        </button>
      </div>
    </>
  );
};
export default Page;

async function signUp(username: string): Promise<void> {
  const challenge = await fetchSignUpChallenge(username);

  const result = await createCredentials(challenge, username);
  if (result.canceled) {
    console.info("WebAuthn Popup is canceled.");
    return;
  }

  await fetchSignUp({ username, credential: result.credential });
}

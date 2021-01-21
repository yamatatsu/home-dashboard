import React from "react";
import { NextPage } from "next";
import { useRecoilState } from "recoil";
import { useGoToHome, LinkToRegisterDevice } from "../lib/routes";
import { sessionIdAtom } from "../lib/recoil";
import { fetchSignInChallenge, fetchSignIn } from "../lib/fetching";
import { getCredentials } from "../lib/WebAuthn";

const Page: NextPage = () => {
  const [sessionId, setSessionId] = useRecoilState(sessionIdAtom);
  const goToHome = useGoToHome();

  React.useEffect(() => {
    if (sessionId) {
      goToHome();
      return;
    }
    signIn("aa")
      .then(({ sessionId }) => {
        setSessionId(sessionId);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [sessionId]);

  return (
    <>
      <h2>Sign In</h2>
      <div>
        <LinkToRegisterDevice />
      </div>
    </>
  );
};
export default Page;

async function signIn(username: string) {
  const { challenge, credentialIds } = await fetchSignInChallenge(username);

  const result = await getCredentials(challenge, credentialIds);
  if (result.canceled) {
    console.info("WebAuthn Popup is canceled.");
    return;
  }

  return fetchSignIn({ username, credential: result.credential });
}

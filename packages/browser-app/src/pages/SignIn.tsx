import React, { FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRecoilState } from "recoil";
import { LinkToSignUp, RedirectTop } from "../routes";
import { sessionIdAtom } from "../recoil";
import { fetchSignInChallenge, fetchSignIn } from "../lib/fetching";
import { getCredentials } from "../lib/WebAuthn";

const schema = Yup.object().shape({
  username: Yup.string().required().min(2).max(100),
});

export const SignIn: FC = () => {
  const [sessionId, setSessionId] = useRecoilState(sessionIdAtom);

  const formik = useFormik({
    initialValues: {
      username: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      signIn(values.username)
        .then(({ sessionId }) => {
          setSessionId(sessionId);
        })
        .catch((err) => {
          console.error(err);
        });
    },
  });

  if (sessionId) {
    return <RedirectTop />;
  }
  return (
    <>
      <h2>Sign In</h2>

      <form onSubmit={formik.handleSubmit}>
        <div>
          <label htmlFor="username">Username: </label>
          <input
            id="username"
            name="username"
            type="username"
            onChange={formik.handleChange}
            value={formik.values.username}
          />
          {formik.errors.username && formik.touched.username ? (
            <div>{formik.errors.username}</div>
          ) : null}
        </div>
        <button type="submit">Submit</button>
      </form>
      <div>
        <LinkToSignUp />
      </div>
    </>
  );
};

async function signIn(username: string) {
  const { challenge, credentialIds } = await fetchSignInChallenge(username);

  const result = await getCredentials(challenge, credentialIds);
  if (result.canceled) {
    console.info("WebAuthn Popup is canceled.");
    return;
  }

  return fetchSignIn({ username, credential: result.credential });
}

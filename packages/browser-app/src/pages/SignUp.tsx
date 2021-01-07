import React, { FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRecoilState } from "recoil";
import { useGoToSignIn, RedirectTop } from "../routes";
import { fetchSignUp, fetchSignUpChallenge } from "../lib/fetching";
import { createCredentials } from "../lib/WebAuthn";
import { sessionIdAtom } from "../recoil";

const schema = Yup.object().shape({
  username: Yup.string().required().min(2).max(100),
});

export const SignUp: FC = () => {
  const goToSignIn = useGoToSignIn();

  const [sessionId] = useRecoilState(sessionIdAtom);

  const formik = useFormik({
    initialValues: {
      username: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      signUp(values.username)
        .then(() => {
          goToSignIn();
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
      <h2>Sign Up</h2>

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
    </>
  );
};

async function signUp(username: string): Promise<void> {
  const challenge = await fetchSignUpChallenge(username);

  const result = await createCredentials(challenge, username);
  if (result.canceled) {
    console.info("WebAuthn Popup is canceled.");
    return;
  }

  await fetchSignUp({ username, credential: result.credential });
}

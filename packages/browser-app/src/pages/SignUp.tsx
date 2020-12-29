import React, { FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import base64url from "base64url";
import { useGoToSignIn } from "../routes";
import { RedirectIfSignedIn } from "../componrnts/RedirectIfSignedIn";
import { fetchSignUp, fetchSignUpChallenge } from "../lib/fetching";
import { createCredentials } from "../lib/WebAuthn";

const schema = Yup.object().shape({
  username: Yup.string().required().min(2).max(100),
});

export const SignUp: FC = () => {
  const goToSignIn = useGoToSignIn();

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

  return (
    <RedirectIfSignedIn>
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
    </RedirectIfSignedIn>
  );
};

async function signUp(username: string): Promise<void> {
  const challenge = await fetchSignUpChallenge(username);

  const result = await createCredentials(challenge, username);
  if (result.canceled) {
    console.info("WebAuthn Popup is canceled.");
    return;
  }

  const decodedCredential = publicKeyCredentialToJSON(result.credential);
  console.log(decodedCredential);

  await fetchSignUp({ username, credential: decodedCredential });
}

const publicKeyCredentialToJSON = (pubKeyCred: any): any => {
  if (pubKeyCred instanceof Array) {
    return pubKeyCred.map(publicKeyCredentialToJSON);
  }

  if (pubKeyCred instanceof ArrayBuffer) {
    return base64url.encode(Buffer.from(pubKeyCred));
  }

  if (pubKeyCred instanceof Object) {
    const obj: Record<string, any> = {};

    for (let key in pubKeyCred) {
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
    }

    return obj;
  }

  return pubKeyCred;
};

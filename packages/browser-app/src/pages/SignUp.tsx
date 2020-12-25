import React, { FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useGoToSignIn } from "../routes";
import { RedirectIfSignedIn } from "../componrnts/RedirectIfSignedIn";
import { SIGN_UP_CHALLENGE_URL } from "../constants";

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

async function signUp(username: string) {
  const response = await fetch(SIGN_UP_CHALLENGE_URL, {
    method: "POST",
    credentials: "include",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!response.ok) {
    throw new Error("Server response is error.");
  }
  const json = await response.json();

  const challenge = json.publicKeyOptions.challenge;
  const userId = json.publicKeyOptions.user.id;
  if (!challenge || typeof challenge !== "string") {
    throw new Error(`challenge should be string.`);
  }
  if (!userId || typeof userId !== "string") {
    throw new Error(`userId should be string.`);
  }

  return navigator.credentials
    .create({
      publicKey: {
        ...json.publicKeyOptions,
        challenge: new TextEncoder().encode(challenge),
        user: {
          ...json.publicKeyOptions.user,
          id: new TextEncoder().encode(userId),
        },
      },
    })
    .then(
      (res) => {
        console.log(res);
        return res;
      },
      (err) => {
        // WebAuthn の Popup がキャンセルされた場合はログを出さない。
        if (err.name === "NotAllowedError") {
          console.info("WebAuthn Popup is canceled.");
          return;
        }

        return Promise.reject(err);
      }
    );
}

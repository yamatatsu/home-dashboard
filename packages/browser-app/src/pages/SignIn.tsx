import React, { FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSetRecoilState } from "recoil";
import { LinkToSignUp } from "../routes";
import { signedInAtom } from "../recoil";
import { RedirectIfSignedIn } from "../componrnts/RedirectIfSignedIn";
import { fetchSignInChallenge } from "../lib/fetching";

const schema = Yup.object().shape({
  username: Yup.string().required().min(2).max(100),
});

export const SignIn: FC = () => {
  const setSignedIn = useSetRecoilState(signedInAtom);

  const formik = useFormik({
    initialValues: {
      username: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      signIn(values.username)
        .then(() => {
          setSignedIn(true);
        })
        .catch((err) => {
          console.error(err);
        });
    },
  });

  return (
    <RedirectIfSignedIn>
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
    </RedirectIfSignedIn>
  );
};

async function signIn(username: string): Promise<void> {
  const { challenge, credentialIds } = await fetchSignInChallenge(username);
  console.info({ challenge, credentialIds });
}

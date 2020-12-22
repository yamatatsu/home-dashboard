import React, { FC } from "react";
import { useSetRecoilState } from "recoil";
import { LinkToSignUp } from "../routes";
import { signedInAtom } from "../recoil";
import { RedirectIfSignedIn } from "../componrnts/RedirectIfSignedIn";

export const SignIn: FC = () => {
  const setSignedIn = useSetRecoilState(signedInAtom);

  return (
    <RedirectIfSignedIn>
      <h2>Sign In</h2>

      <div>
        <button
          type="button"
          onClick={() => {
            setSignedIn(true);
          }}
        >
          signIn
        </button>
      </div>
      <div>
        <LinkToSignUp />
      </div>
    </RedirectIfSignedIn>
  );
};

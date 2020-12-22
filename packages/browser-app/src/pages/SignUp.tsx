import React, { FC } from "react";
import { useGoToSignIn } from "../routes";
import { RedirectIfSignedIn } from "../componrnts/RedirectIfSignedIn";

export const SignUp: FC = () => {
  const goToSignIn = useGoToSignIn();

  return (
    <RedirectIfSignedIn>
      <h2>Sign Up</h2>

      <div>
        <button
          type="button"
          onClick={() => {
            console.log("Awesome Sign Up!!!");
            goToSignIn();
          }}
        >
          Sign Up
        </button>
      </div>
    </RedirectIfSignedIn>
  );
};

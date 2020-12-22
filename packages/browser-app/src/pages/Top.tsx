import React, { FC } from "react";
import { useSetRecoilState } from "recoil";
import { signedInAtom } from "../recoil";
import { RedirectIfNotSignedIn } from "../componrnts/RedirectIfNotSignedIn";

export const Top: FC = () => {
  const setSignedIn = useSetRecoilState(signedInAtom);

  return (
    <RedirectIfNotSignedIn>
      <div>awesome Contents</div>
      <button
        type="button"
        onClick={() => {
          setSignedIn(false);
        }}
      >
        signout
      </button>
    </RedirectIfNotSignedIn>
  );
};

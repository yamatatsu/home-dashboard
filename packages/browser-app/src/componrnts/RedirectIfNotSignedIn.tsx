import React, { FC } from "react";
import { useRecoilState } from "recoil";
import { RedirectSignIn } from "../routes";
import { signedInAtom } from "../recoil";

export const RedirectIfNotSignedIn: FC = (props) => {
  const { children } = props;

  const [signedIn] = useRecoilState(signedInAtom);
  if (!signedIn) {
    return <RedirectSignIn />;
  }

  return <>{children}</>;
};

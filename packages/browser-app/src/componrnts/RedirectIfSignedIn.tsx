import React, { FC } from "react";
import { useRecoilState } from "recoil";
import { RedirectTop } from "../routes";
import { signedInAtom } from "../recoil";

export const RedirectIfSignedIn: FC = (props) => {
  const { children } = props;

  const [signedIn] = useRecoilState(signedInAtom);
  if (signedIn) {
    return <RedirectTop />;
  }

  return <>{children}</>;
};

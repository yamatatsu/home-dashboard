import React, { FC } from "react";
import { useRecoilState } from "recoil";
import { RedirectSignIn } from "../routes";
import { sessionIdAtom } from "../recoil";

export const RedirectIfNotSignedIn: FC = (props) => {
  const { children } = props;

  const [sessionId] = useRecoilState(sessionIdAtom);
  if (!sessionId) {
    return <RedirectSignIn />;
  }

  return <>{children}</>;
};

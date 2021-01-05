import React, { FC } from "react";
import { useRecoilState } from "recoil";
import { RedirectTop } from "../routes";
import { sessionIdAtom } from "../recoil";

export const RedirectIfSignedIn: FC = (props) => {
  const { children } = props;

  const [sessionId] = useRecoilState(sessionIdAtom);
  if (sessionId) {
    return <RedirectTop />;
  }

  return <>{children}</>;
};

import React, { FC } from "react";
import { useSetRecoilState, useRecoilValueLoadable } from "recoil";
import { sessionIdAtom, remoEventsSelector } from "../recoil";
import { RedirectIfNotSignedIn } from "../componrnts/RedirectIfNotSignedIn";

export const Top: FC = () => {
  const setSessionId = useSetRecoilState(sessionIdAtom);
  const remoEventsResult = useRecoilValueLoadable(remoEventsSelector);

  if (remoEventsResult.state !== "hasValue") {
    return null;
  }
  return (
    <RedirectIfNotSignedIn>
      <div>awesome Contents</div>
      <div>{JSON.stringify(remoEventsResult.getValue())}</div>
      <button
        type="button"
        onClick={() => {
          setSessionId("");
        }}
      >
        signout
      </button>
    </RedirectIfNotSignedIn>
  );
};

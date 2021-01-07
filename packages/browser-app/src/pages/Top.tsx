import React, { FC } from "react";
import { useSetRecoilState, useRecoilValueLoadable } from "recoil";
import { sessionIdAtom, remoEventsSelector } from "../recoil";
import { RedirectSignIn } from "../routes";

export const Top: FC = () => {
  const setSessionId = useSetRecoilState(sessionIdAtom);

  const remoEventsResult = useRecoilValueLoadable(remoEventsSelector);

  switch (remoEventsResult.state) {
    case "loading": {
      return <div>Loading...</div>;
    }
    case "hasError": {
      throw remoEventsResult.errorOrThrow();
    }
    case "hasValue": {
      const value = remoEventsResult.getValue();
      if (!value.signed) {
        return <RedirectSignIn />;
      }
      return (
        <>
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
        </>
      );
    }
  }
};

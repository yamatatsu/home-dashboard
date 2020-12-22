import React, { useMemo, FC } from "react";
import { RecoilRoot } from "recoil";
import { RoconRoot } from "rocon/react";
import { createBrowserHistory } from "history";
import { Routes } from "./routes";

export const App: FC = () => {
  const history = useMemo(() => {
    return createBrowserHistory();
  }, []);
  return (
    <RecoilRoot>
      <RoconRoot history={history}>
        <Routes />
      </RoconRoot>
    </RecoilRoot>
  );
};

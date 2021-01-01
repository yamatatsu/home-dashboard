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
    <ErrorBoundary>
      <RecoilRoot>
        <RoconRoot history={history}>
          <Routes />
        </RoconRoot>
      </RecoilRoot>
    </ErrorBoundary>
  );
};

type Props = React.PropsWithChildren<{}>;

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log("error: " + error);
    console.log("errorInfo: " + JSON.stringify(errorInfo));
    console.log("componentStack: " + errorInfo.componentStack);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // FIXME:
      return <div>Error.</div>;
    }

    return this.props.children;
  }
}

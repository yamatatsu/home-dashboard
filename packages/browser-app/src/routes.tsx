import React, { FC } from "react";
import { Path, useRoutes, useNavigate, Link } from "rocon/react";
import { Redirect } from "rocon/lib/react/components/Redirect";
import { Top } from "./pages/Top";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";

export const toplevelRoutes = Path()
  .exact({
    action: () => <Top />,
  })
  .route("signUp", (route) => route.action(() => <SignUp />))
  .route("signIn", (route) => route.action(() => <SignIn />));

export const Routes: FC = () => {
  return useRoutes(toplevelRoutes);
};

export const useGoToTop = () => {
  const navigate = useNavigate();
  return () => navigate(toplevelRoutes.exactRoute);
};

export const useGoToSignIn = () => {
  const navigate = useNavigate();
  return () => navigate(toplevelRoutes._.signIn);
};

export const LinkToSignUp: FC = () => {
  return <Link route={toplevelRoutes._.signUp}>Sign Up</Link>;
};
export const LinkToSignIn: FC = () => {
  return <Link route={toplevelRoutes._.signIn}>Sign In</Link>;
};
export const RedirectTop: FC = () => {
  return <Redirect route={toplevelRoutes.exactRoute} />;
};
export const RedirectSignIn: FC = () => {
  return <Redirect route={toplevelRoutes._.signIn} />;
};

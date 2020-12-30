import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import _signUpChallenge from "./signUpChallenge";
import _signUp from "./signUp";
import _signInChallenge from "./signInChallenge";
import _signIn from "./signIn";

export const signUpChallenge: APIGatewayProxyHandlerV2 = async (event) => {
  return _signUpChallenge(event, new Date());
};
export const signUp: APIGatewayProxyHandlerV2 = async (event) => {
  return _signUp(event, new Date());
};
export const signInChallenge: APIGatewayProxyHandlerV2 = async (event) => {
  return _signInChallenge(event, new Date());
};
export const signIn: APIGatewayProxyHandlerV2 = async (event) => {
  return _signIn(event, new Date());
};

import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import _signUpChallenge from "./signUpChallenge";
import _signUp from "./signUp";

export const signUpChallenge: APIGatewayProxyHandlerV2 = async (event) => {
  return _signUpChallenge(event, new Date());
};
export const signUp: APIGatewayProxyHandlerV2 = async (event) => {
  return _signUp(event, new Date());
};

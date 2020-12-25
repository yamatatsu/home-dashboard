import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import _signUpChallenge from "./signUpChallenge";

export const signUpChallenge: APIGatewayProxyHandlerV2 = async (event) => {
  return _signUpChallenge(event, new Date());
};

import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import _getAuthChallenge from "./getAuthChallenge";

export const getAuthChallenge: APIGatewayProxyHandlerV2 = async () => {
  return _getAuthChallenge();
};

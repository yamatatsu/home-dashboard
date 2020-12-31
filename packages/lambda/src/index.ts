import {
  APIGatewayProxyHandlerV2,
  ScheduledHandler,
  SQSHandler,
} from "aws-lambda";
import _signUpChallenge from "./handlers/signUpChallenge";
import _signUp from "./handlers/signUp";
import _signInChallenge from "./handlers/signInChallenge";
import _signIn from "./handlers/signIn";
import _authorize from "./handlers/authorize";

import _fetchRemoApi from "./handlers/fetchRemoApi";
import _putRemoData from "./handlers/putRemoData";
import _backupRemoData from "./handlers/backupRemoData";

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
export const authorize = async (event: any) => {
  return _authorize(event);
};

export const fetchRemoApi: ScheduledHandler = async () => {
  return _fetchRemoApi();
};
export const putRemoData: SQSHandler = async (event) => {
  return _putRemoData(event.Records[0].body, new Date());
};
export const backupRemoData: SQSHandler = async (event) => {
  return _backupRemoData(event.Records[0].body, new Date());
};

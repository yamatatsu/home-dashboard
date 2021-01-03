import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import * as cookie from "cookie";
import { getSession } from "../lib/db";

type Event = Pick<APIGatewayRequestAuthorizerEvent, "headers">;

export default async function authorize(
  event: Event
): Promise<APIGatewayAuthorizerResult> {
  console.log("event: %o", event);
  const cookieString = event.headers?.Cookie;
  if (!cookieString) {
    throw new Error("No cookie has provided.");
  }
  const cookies = cookie.parse(cookieString);
  console.info("sessionId: ", cookies.sessionId);

  if (!cookies.sessionId) {
    throw new Error("cookies.sessionId is empty.");
  }
  const session = await getSession(cookies.sessionId);
  if (!session) {
    throw new Error("No session has found.");
  }
  console.info("session: ", session);

  return {
    principalId: session.username,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [],
    },
    context: {},
  };
}

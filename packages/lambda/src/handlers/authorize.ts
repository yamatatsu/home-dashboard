import * as cookie from "cookie";
import { getGetSessionInput } from "../models/session";
import { AuthTableClient } from "../lib/awsSdk";

/**
 * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html#http-api-lambda-authorizer.payload-format
 */
type Event = { headers: Record<string, string> };
/**
 * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html#http-api-lambda-authorizer.payload-format-response
 */
type Result =
  | { isAuthorized: false; context: {} }
  | { isAuthorized: true; context: { username: string } };

export default async function authorize(event: Event): Promise<Result> {
  console.log("event: %o", event);
  // const cookieString = event.headers?.Cookie;
  // if (!cookieString) {
  //   throw new Error("No cookie has provided.");
  // }
  // const cookies = cookie.parse(cookieString);
  // console.info("sessionId: ", cookies.sessionId);
  const sessionId = event.headers?.["x-hd-auth"];
  console.info("sessionId: ", sessionId);

  if (!sessionId) {
    console.info("sessionId is empty.");
    return { isAuthorized: false, context: {} };
  }
  const session = await AuthTableClient.get(getGetSessionInput(sessionId));
  if (!session.Item) {
    console.info("No session has found.");
    return { isAuthorized: false, context: {} };
  }

  return { isAuthorized: true, context: { username: session.Item.username } };
}

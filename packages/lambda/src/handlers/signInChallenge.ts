import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import * as Yup from "yup";
import { queryCredentials, putSignInChallenge } from "../lib/db";
import { createChallenge } from "../lib/webAuthn";

type Event = Pick<APIGatewayProxyEventV2, "body">;

const eventSchema = Yup.object()
  .required()
  .shape({ body: Yup.string().required() });
const bodySchema = Yup.object()
  .required()
  .shape({
    username: Yup.string().required().min(2).max(100),
  });

/**
 * Sign In Challenge 処理
 *
 * @param event
 */
export default async function signInChallenge(
  event: Event,
  now: Date
): Promise<APIGatewayProxyStructuredResultV2> {
  let username: string;
  try {
    const validEvent = await eventSchema.validate(event);
    const validBody = await bodySchema.validate(JSON.parse(validEvent.body));
    username = validBody.username;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify(err),
    };
  }

  const credentials = await queryCredentials(username);
  if (!credentials) {
    return { statusCode: 400, body: "No credential is found." };
  }
  const credentialIds = credentials.map((c) => c.credentialId);

  const challenge = createChallenge();

  await putSignInChallenge(username, challenge, now);

  return {
    statusCode: 201,
    body: JSON.stringify({ challenge, credentialIds }),
  };
}

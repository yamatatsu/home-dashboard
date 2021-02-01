import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import * as z from "zod";
import { createChallenge as createChallengeModel } from "../models/challenge";
import { putSignInChallenge } from "../models/challengeRepository";
import { queryCredentials } from "../models/credentialRepository";
import { createChallenge } from "../lib/webAuthn";

type Event = Pick<APIGatewayProxyEventV2, "body">;

const eventSchema = z.object({ body: z.string() }).nonstrict();
const bodySchema = z.object({ username: z.string().min(2).max(100) });

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
    const validEvent = eventSchema.parse(event);
    const validBody = bodySchema.parse(JSON.parse(validEvent.body));
    username = validBody.username;
  } catch (err) {
    console.error(err);
    return {
      statusCode: 400,
      body: err.message,
    };
  }

  const credentials = await queryCredentials(username);
  if (credentials.length === 0) {
    return { statusCode: 400, body: "No credential is found." };
  }
  const credentialIds = credentials.map((c) => c.credentialId);

  const challenge = createChallenge();

  await putSignInChallenge(createChallengeModel(username, challenge, now));

  return {
    statusCode: 201,
    body: JSON.stringify({ challenge, credentialIds }),
  };
}

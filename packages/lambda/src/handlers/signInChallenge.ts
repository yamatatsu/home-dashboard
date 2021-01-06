import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import * as z from "zod";
import { getSignInChallengeRecord } from "../models/challenge";
import { getQueryCredentialsInput } from "../models/credential";
import { AuthTableClient } from "../lib/awsSdk";
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

  const credentials = await AuthTableClient.query(
    getQueryCredentialsInput(username)
  );
  if (!credentials.Items) {
    return { statusCode: 400, body: "No credential is found." };
  }
  const credentialIds = credentials.Items.map((c) => c.credentialId);

  const challenge = createChallenge();

  const challengeRecord = getSignInChallengeRecord(username, challenge, now);
  await AuthTableClient.put({ Item: challengeRecord });

  return {
    statusCode: 201,
    body: JSON.stringify({ challenge, credentialIds }),
  };
}

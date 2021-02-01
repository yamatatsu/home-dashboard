import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import * as z from "zod";
import { createChallenge as createChallengeModel } from "../models/challenge";
import { putSignUpChallenge } from "../models/challengeRepository";
import { createChallenge } from "../lib/webAuthn";

type Event = Pick<APIGatewayProxyEventV2, "body">;

const eventSchema = z.object({ body: z.string() }).nonstrict();
const bodySchema = z.object({ username: z.string().min(2).max(100) });

/**
 * Sign Up Challenge 処理
 * WebAuthnなのでusernameの重複チェックはしない。
 * 本来であればこのようなMFAではないWebAuthn実装をする場合、usernameをemailなどにして、OTPによるメアドの所有チェックをする必要があるが今回は簡便のためにこれを行わない。
 * 代わりに、SignUpを承認制とし、管理者がapproveしないとSignInできないようにする。この実装はサイトのユーザーが有限（今回は家族のみ）の場合に妥当であると考える。
 *
 * @param event
 */
export default async function signUpChallenge(
  event: Event,
  now: Date
): Promise<APIGatewayProxyStructuredResultV2> {
  const result = varifyEvent(event);
  if (!result.success) {
    return { statusCode: 400, body: result.error.message };
  }
  const username: string = result.data.username;
  const challenge = createChallenge();

  await putSignUpChallenge(createChallengeModel(username, challenge, now));

  return { statusCode: 201, body: JSON.stringify({ challenge }) };
}

const varifyEvent = (event: Event) => {
  const resultEvent = eventSchema.safeParse(event);
  if (!resultEvent.success) {
    return resultEvent;
  }
  return bodySchema.safeParse(JSON.parse(resultEvent.data.body));
};

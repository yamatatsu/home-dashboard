import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import * as Yup from "yup";
import { putSignUpChallenge } from "../lib/db";
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
  const { AUTH_TABLE_NAME } = process.env;
  if (!AUTH_TABLE_NAME) {
    throw new Error("Enviroment variable `AUTH_TABLE_NAME` is required.");
  }

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

  const challenge = createChallenge();

  await putSignUpChallenge(username, challenge, now);

  return {
    statusCode: 201,
    body: JSON.stringify({ challenge }),
  };
}

import fetch from "node-fetch";
import { SNS } from "../lib/awsSdk";

export default async function fetchRemoApi(): Promise<void> {
  // jest でのテストしやすさの為に関数内で環境変数を展開する
  const { REMO_TOKEN, TOPIC_ARN } = process.env;
  if (!REMO_TOKEN)
    throw new Error("Enviroment variable `REMO_TOKEN` is required.");
  if (!TOPIC_ARN)
    throw new Error("Enviroment variable `TOPIC_ARN` is required.");

  console.time("fetching-remo-api");
  const result = await fetch("https://api.nature.global/1/devices", {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${REMO_TOKEN}`,
    },
  });
  console.timeEnd("fetching-remo-api");

  const jsonAsText = await result.text();

  console.info("A SQS message will send as `%s`", jsonAsText);

  await SNS.publish({ TopicArn: TOPIC_ARN, Message: jsonAsText });
}

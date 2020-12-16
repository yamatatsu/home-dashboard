import { ScheduledHandler } from "aws-lambda";
import fetch from "node-fetch";
import * as AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler: ScheduledHandler = async (event) => {
  console.info("invoked!!!", event.time);

  const { REMO_TOKEN, TABLE_NAME } = process.env;
  if (!REMO_TOKEN)
    throw new Error("Enviroment variable `REMO_TOKEN` is required.");
  if (!TABLE_NAME)
    throw new Error("Enviroment variable `TABLE_NAME` is required.");

  console.time("fetching-remo-api");
  const result = await fetch("https://api.nature.global/1/devices", {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${REMO_TOKEN}`,
    },
  });
  console.timeEnd("fetching-remo-api");

  const json = await result.json();

  const ttl = Math.floor(Date.now() / 1000) + 1 * 60 * 60; // 1 hour
  const params = {
    TableName: TABLE_NAME,
    Item: { time: event.time, json, ttl },
  };
  console.info("it will be saved as %o", params);
  await docClient.put(params).promise();
};

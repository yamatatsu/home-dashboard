import * as AWS from "aws-sdk";
import { sqsMessageSchema, remoDataSchema } from "../schema";
import { DocumentClient } from "../lib/awsSdk";
import {
  remoEventSchema,
  createRemoEventRecord,
  RemoEvent,
  RemoEventRecord,
} from "../models/remoEvent";

type RemoData = {
  name: string;
  id: string;
  newest_events: { [key: string]: { val: number; created_at: string } };
};

export default async function putRemoData(
  messageBody: string,
  date: Date
): Promise<void> {
  // jest でのテストしやすさの為に関数内で環境変数を展開する
  const { MAIN_TABLE_NAME } = process.env;
  if (!MAIN_TABLE_NAME)
    throw new Error("Enviroment variable `MAIN_TABLE_NAME` is required.");

  console.info("messageBody: %s", messageBody);

  const sqsMessage = sqsMessageSchema.parse(JSON.parse(messageBody));
  const remoDataList = remoDataSchema.parse(JSON.parse(sqsMessage.Message));
  if (remoDataList.length === 0) {
    console.warn("SQS Message is empty array.");
    return;
  }

  const writeRequests = remoDataList
    .map((remoData) => remoDataToRemoEvents(remoData))
    .flat()
    .map((a) => remoEventSchema.parse(a))
    .map((validated) => createRemoEventRecord(validated, date))
    .map(remoEventToWriteRequest);

  await DocumentClient.batchWrite({
    RequestItems: { [MAIN_TABLE_NAME]: writeRequests },
  });
}

const remoDataToRemoEvents = (data: RemoData): RemoEvent[] => {
  const { id, name, newest_events } = data;
  return Object.entries(newest_events).map(([key, event]) => {
    return {
      deviceId: id,
      deviceName: name,
      eventType: key,
      value: event.val,
      createdAt: event.created_at,
    };
  });
};

const remoEventToWriteRequest = (
  record: RemoEventRecord
): AWS.DynamoDB.DocumentClient.WriteRequest => {
  return { PutRequest: { Item: record } };
};

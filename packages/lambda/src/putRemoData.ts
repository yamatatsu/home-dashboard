import * as yup from "yup";
import * as AWS from "aws-sdk";
import { RemoEvent } from "./schema";
import { DocumentClient } from "./awsSdk";

type RemoData = {
  name: string;
  id: string;
  newest_events: { [key: string]: { val: number; created_at: string } };
};

export default async function putRemoData(
  messageBody: string,
  date: Date
): Promise<void> {
  console.info("messageBody: %s", messageBody);
  const sqsMessage = await sqsMessageSchema.validate(JSON.parse(messageBody));

  const remoDataList = await remoDataSchema.validate(
    JSON.parse(sqsMessage.Message)
  );

  if (remoDataList.length === 0) {
    console.warn("SQS Message is empty array.");
    return;
  }

  const { TABLE_NAME } = process.env;
  if (!TABLE_NAME)
    throw new Error("Enviroment variable `TABLE_NAME` is required.");

  const ttl = getTtl(date, 6);

  const writeRequests = remoDataList
    .map(remoDataToRemoEvents)
    .flat()
    .map((event) => remoEventToWriteRequest(event, ttl));

  const params: AWS.DynamoDB.DocumentClient.BatchWriteItemInput = {
    RequestItems: { [TABLE_NAME]: writeRequests },
  };
  console.info("it will be saved as %o", params);
  await DocumentClient.batchWrite(params);
}

const sqsMessageSchema = yup
  .object()
  .shape({ Message: yup.string().required() });

const eventSchema = yup.object({
  val: yup.number().required(),
  created_at: yup.string().required(),
});
const remoDataSchema = yup
  .array(
    yup.object().shape({
      name: yup.string().required(),
      id: yup.string().required(),
      newest_events: yup.object().required().shape({
        hu: yup.object(),
        il: yup.object(),
        mo: yup.object(),
        te: yup.object(),
      }),
    })
  )
  .required();

const getTtl = (date: Date, hour: number) =>
  Math.floor(date.getTime() / 1000) + hour * 60 * 60;

const remoDataToRemoEvents = (data: RemoData): RemoEvent[] => {
  const { id, name, newest_events } = data;
  return Object.entries(newest_events).map(([key, event]) => {
    eventSchema.validate(event);
    return {
      partitionKey: `remoEvent:${id}_${key}`,
      sortKey: event.created_at,
      deviceId: id,
      deviceName: name,
      type: key,
      createdAt: event.created_at,
      value: event.val,
    };
  });
};
const remoEventToWriteRequest = (
  event: RemoEvent,
  ttl: number
): AWS.DynamoDB.DocumentClient.WriteRequest => {
  return {
    PutRequest: { Item: { ...event, ttl } },
  };
};

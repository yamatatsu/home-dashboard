import * as AWS from "aws-sdk";
import * as z from "zod";
import { getTtl } from "./util";

export type RemoEvent = {
  deviceId: string;
  deviceName: string;
  eventType: string;
  value: number;
  createdAt: string;
};

export type RemoEventRecord = {
  partitionKey: string;
  sortKey: string;
  ttl: number;
} & RemoEvent;

export const remoEventSchema = z.object({
  deviceId: z.string(),
  deviceName: z.string(),
  eventType: z.string(),
  createdAt: z.string(),
  value: z.number(),
});

export function createWriteRemoEventRequest(
  remoEvent: RemoEvent,
  now: Date
): AWS.DynamoDB.DocumentClient.WriteRequest {
  return createWriteRequest(createRemoEventRecord(remoEvent, now));
}

export function createQueryRemoEventInput(
  tableName: string,
  deviceId: string
): AWS.DynamoDB.DocumentClient.QueryInput {
  return {
    TableName: tableName,
    KeyConditionExpression: "#pKey = :pKey and begins_with(#sKey, :sKey)",
    ExpressionAttributeNames: {
      "#pKey": "partitionKey",
      "#sKey": "sortKey",
    },
    ExpressionAttributeValues: {
      ":pKey": getPKey(deviceId),
      ":sKey": getSKey(),
    },
  };
}
function createRemoEventRecord(
  remoEvent: RemoEvent,
  now: Date
): RemoEventRecord {
  const { deviceId, deviceName, eventType, value, createdAt } = remoEvent;
  return {
    partitionKey: getPKey(deviceId),
    sortKey: getSKey(eventType, createdAt),
    deviceId,
    deviceName,
    eventType,
    value,
    createdAt,
    ttl: getTtl(now, 3 * 24),
  };
}

function getPKey(deviceId: string) {
  return `deviceId:${deviceId}`;
}
function getSKey(eventType?: string, createdAt?: string) {
  if (!eventType) {
    return "eventType:";
  }
  if (!createdAt) {
    return `eventType:${eventType}|createdAt:`;
  }
  return `eventType:${eventType}|createdAt:${createdAt}`;
}

function createWriteRequest(
  record: RemoEventRecord
): AWS.DynamoDB.DocumentClient.WriteRequest {
  return { PutRequest: { Item: record } };
}

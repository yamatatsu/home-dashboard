import { MainTableClient } from "../lib/awsSdk";
import { RemoEvent, verifyRemoEvent } from "./remoEvent";

export async function queryRemoEvents(deviceId: string): Promise<RemoEvent[]> {
  const result = await MainTableClient.query({
    KeyConditionExpression: "#pKey = :pKey and begins_with(#sKey, :sKey)",
    ExpressionAttributeNames: {
      "#pKey": "partitionKey",
      "#sKey": "sortKey",
    },
    ExpressionAttributeValues: {
      ":pKey": getPKey(deviceId),
      ":sKey": getSKey(),
    },
  });
  if (!result.Items) return [];
  return result.Items.map((item) => verifyRemoEvent(item as RemoEvent));
}

export async function batchWriteRemoEvents(
  remoEvents: RemoEvent[]
): Promise<void> {
  const writeRequests = remoEvents.map((remoEvent) => ({
    PutRequest: {
      Item: {
        partitionKey: getPKey(remoEvent.deviceId),
        sortKey: getSKey(remoEvent.eventType, remoEvent.createdAt),
        ...remoEvent,
      },
    },
  }));
  await MainTableClient.batchWrite(writeRequests);
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

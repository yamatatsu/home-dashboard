import { sqsMessageSchema, remoDataSchema } from "../schema";
import { createRemoEvent, PreRemoEvent } from "../models/remoEvent";
import { batchWriteRemoEvents } from "../models/remoEventRepository";

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

  const sqsMessage = sqsMessageSchema.parse(JSON.parse(messageBody));
  const remoDataList = remoDataSchema.parse(JSON.parse(sqsMessage.Message));
  if (remoDataList.length === 0) {
    console.warn("SQS Message is empty array.");
    return;
  }

  const remoEvents = remoDataList
    .map((remoData) => remoDataToRemoEvents(remoData))
    .flat()
    .map((a) => createRemoEvent(a, date));

  await batchWriteRemoEvents(remoEvents);
}

const remoDataToRemoEvents = (data: RemoData): PreRemoEvent[] => {
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

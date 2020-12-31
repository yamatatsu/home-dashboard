import * as z from "zod";

export type RemoEvent = {
  partitionKey: string;
  sortKey: string;
  deviceId: string;
  deviceName: string;
  type: string;
  createdAt: string;
  value: number;
};

export const sqsMessageSchema = z
  .object({
    Message: z.string(),
    MessageId: z.string(),
  })
  .nonstrict();

export const eventSchema = z.object({
  val: z.number(),
  created_at: z.string(),
});
export const remoDataSchema = z.array(
  z
    .object({
      name: z.string(),
      id: z.string(),
      newest_events: z.record(eventSchema),
    })
    .nonstrict()
);

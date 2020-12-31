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

export function createRemoEventRecord(
  remoEvent: RemoEvent,
  now: Date
): RemoEventRecord {
  const { deviceId, deviceName, eventType, value, createdAt } = remoEvent;
  return {
    partitionKey: `deviceId:${deviceId}`,
    sortKey: `eventType:${eventType}|createdAt:${createdAt}`,
    deviceId,
    deviceName,
    eventType,
    value,
    createdAt,
    ttl: getTtl(now, 6),
  };
}

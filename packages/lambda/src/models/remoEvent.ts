import * as z from "zod";
import { getTtl } from "./util";

export type PreRemoEvent = {
  deviceId: string;
  deviceName: string;
  eventType: string;
  value: number;
  createdAt: string;
};

export type RemoEvent = {
  __verified__: "Model:Session";
  ttl: number;
} & PreRemoEvent;

export const schema = z.object({
  deviceId: z.string(),
  deviceName: z.string(),
  eventType: z.string(),
  createdAt: z.string(),
  value: z.number(),
  ttl: z.number(),
});

export function createRemoEvent(remoEvent: PreRemoEvent, now: Date): RemoEvent {
  return verifyRemoEvent({
    ...remoEvent,
    ttl: getTtl(now, 3 * 24),
  });
}

export function verifyRemoEvent(
  remoEvent: PreRemoEvent & { ttl: number }
): RemoEvent {
  const item: PreRemoEvent = schema.parse(remoEvent);
  return item as RemoEvent;
}

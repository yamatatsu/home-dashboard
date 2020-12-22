import { create as object } from "yup/lib/object";
import { create as array } from "yup/lib/array";
import { create as string } from "yup/lib/string";
import { create as number } from "yup/lib/number";

export type RemoEvent = {
  partitionKey: string;
  sortKey: string;
  deviceId: string;
  deviceName: string;
  type: string;
  createdAt: string;
  value: number;
};

export const sqsMessageSchema = object().shape({
  Message: string().required(),
  MessageId: string().required(),
});

export const eventSchema = object({
  val: number().required(),
  created_at: string().required(),
});
export const remoDataSchema = array(
  object().shape({
    name: string().required(),
    id: string().required(),
    newest_events: object().required().shape({
      hu: object(),
      il: object(),
      mo: object(),
      te: object(),
    }),
  })
).required();

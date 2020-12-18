import * as yup from "yup";

export type RemoEvent = {
  partitionKey: string;
  sortKey: string;
  deviceId: string;
  deviceName: string;
  type: string;
  createdAt: string;
  value: number;
};

export const sqsMessageSchema = yup.object().shape({
  Message: yup.string().required(),
  MessageId: yup.string().required(),
});

export const eventSchema = yup.object({
  val: yup.number().required(),
  created_at: yup.string().required(),
});
export const remoDataSchema = yup
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

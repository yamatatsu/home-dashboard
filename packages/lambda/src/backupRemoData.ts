import { sqsMessageSchema } from "./schema";
import { S3 } from "./awsSdk";

export default async function backupRemoData(
  messageBody: string,
  date: Date
): Promise<void> {
  console.info("messageBody: %s", messageBody);
  const sqsMessage = await sqsMessageSchema.validate(JSON.parse(messageBody));

  const { BUCKET_NAME } = process.env;
  if (!BUCKET_NAME)
    throw new Error("Enviroment variable `BUCKET_NAME` is required.");

  await S3.putObject({
    Bucket: BUCKET_NAME,
    Key: sqsMessage.MessageId,
    Body: sqsMessage.Message,
    Expires: getExpiresAt(date, 1),
  });
}

const getExpiresAt = (date: Date, day: number) =>
  new Date(date.getTime() + day * 24 * 60 * 60 * 1000);

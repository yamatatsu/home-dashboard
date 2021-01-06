import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import { createQueryRemoEventInput } from "../models/remoEvent";
import { DocumentClient } from "../lib/awsSdk";

type Event = Pick<APIGatewayProxyEventV2, "body">;

const deviceIds = [
  "a09a420d-56b9-4931-9421-7420f118d546",
  "ca2ab384-3874-4571-aa19-59983c827108",
];

export default async function getRemoEvents(
  event: Event
): Promise<APIGatewayProxyStructuredResultV2> {
  const { MAIN_TABLE_NAME } = process.env;
  if (!MAIN_TABLE_NAME)
    throw new Error("Enviroment variable `MAIN_TABLE_NAME` is required.");

  const results = await Promise.all(
    deviceIds.map((id) =>
      DocumentClient.query(createQueryRemoEventInput(MAIN_TABLE_NAME, id))
    )
  );
  const remoEvents = results.map((r) => r.Items).flat();

  return { statusCode: 200, body: JSON.stringify({ remoEvents }) };
}

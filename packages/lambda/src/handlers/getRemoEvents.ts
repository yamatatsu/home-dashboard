import {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import { queryRemoEvents } from "../models/remoEventRepository";

type Event = Pick<APIGatewayProxyEventV2, "body">;

const deviceIds = [
  "a09a420d-56b9-4931-9421-7420f118d546",
  "ca2ab384-3874-4571-aa19-59983c827108",
];

export default async function getRemoEvents(
  event: Event
): Promise<APIGatewayProxyStructuredResultV2> {
  const remoEvents = (
    await Promise.all(deviceIds.map((id) => queryRemoEvents(id)))
  ).flat();

  return { statusCode: 200, body: JSON.stringify({ remoEvents }) };
}

import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from "aws-lambda";
import { DocumentClient } from "../lib/awsSdk";

type Event = Pick<APIGatewayProxyEventV2, "body">;

export default async function getRemoEvents(
  event: Event
): Promise<APIGatewayProxyResultV2> {
  // const { MAIN_TABLE_NAME } = process.env;
  // if (!MAIN_TABLE_NAME)
  //   throw new Error("Enviroment variable `MAIN_TABLE_NAME` is required.");

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
}

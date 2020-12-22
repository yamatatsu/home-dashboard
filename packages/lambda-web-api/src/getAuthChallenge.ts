import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as crypto from "crypto";

console.info("Loading function");

export default async function getAuthChallenge(): Promise<APIGatewayProxyStructuredResultV2> {
  const challenge = crypto
    .randomBytes(128)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=*$/g, "");

  return {
    statusCode: 201,
    body: JSON.stringify({ challenge }),
    headers: { "Access-Control-Allow-Origin": "http://localhost:1234" },
  };
}
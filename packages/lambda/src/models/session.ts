import * as AWS from "aws-sdk";
import { getTtl } from "./util";

type GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;
type PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;

export type Session = {
  partitionKey: string;
  sortKey: string;
  sessionId: string;
  username: string;
  ttl: number;
  createdAt: string;
};

export function getGetSessionInput(
  sessionId: string
): Omit<GetItemInput, "TableName"> {
  return {
    Key: {
      partitionKey: getKey(sessionId),
      sortKey: getKey(sessionId),
    },
  };
}

export function getPutSessionInput(
  sessionId: string,
  username: string,
  createdAt: Date
): Omit<PutItemInput, "TableName"> {
  const item: Session = {
    partitionKey: getKey(sessionId),
    sortKey: getKey(sessionId),
    sessionId,
    username,
    ttl: getTtl(createdAt, 12),
    createdAt: createdAt.toISOString(),
  };
  return { Item: item };
}

function getKey(sessionId: string) {
  return `session:${sessionId}`;
}

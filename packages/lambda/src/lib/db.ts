import { DocumentClient } from "./awsSdk";

export type Session = {
  partitionKey: string;
  sortKey: string;
  sessionId: string;
  username: string;
  ttl: number;
  createdAt: string;
};

export async function getSession(
  sessionId: string
): Promise<Session | undefined> {
  const params = {
    TableName: getAuthTableName(),
    Key: {
      partitionKey: `session:${sessionId}`,
      sortKey: `session:${sessionId}`,
    },
  };
  const result = await DocumentClient.get(params);
  return result.Item as Session | undefined;
}

export async function putSession(
  sessionId: string,
  username: string,
  createdAt: Date
): Promise<boolean> {
  const item: Session = {
    partitionKey: `session:${sessionId}`,
    sortKey: `session:${sessionId}`,
    sessionId,
    username,
    ttl: getTtl(createdAt, 12),
    createdAt: createdAt.toISOString(),
  };
  const params = { TableName: getAuthTableName(), Item: item };
  const result = await DocumentClient.put(params);
  return !!result.Attributes;
}

function getAuthTableName() {
  const { AUTH_TABLE_NAME } = process.env;
  if (!AUTH_TABLE_NAME) {
    throw new Error("Enviroment variable `AUTH_TABLE_NAME` is required.");
  }
  return AUTH_TABLE_NAME;
}

const getTtl = (date: Date, hour: number) =>
  Math.floor(date.getTime() / 1000) + hour * 60 * 60;

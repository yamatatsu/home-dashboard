import { DocumentClient } from "./awsSdk";

export type JWK = { kty: "EC"; crv: string; x: string; y: string };
export type Credential = {
  partitionKey: string;
  sortKey: string;
  username: string;
  credentialId: string;
  jwk: JWK;
  signCount: number;
  createdAt: string;
  approved: boolean;
};
export type Session = {
  partitionKey: string;
  sortKey: string;
  sessionId: string;
  username: string;
  ttl: number;
  createdAt: string;
};

export async function getCredential(
  username: string,
  credentialId: string
): Promise<Credential | undefined> {
  const params = {
    TableName: getAuthTableName(),
    Key: {
      partitionKey: `user:${username}`,
      sortKey: `credential:${credentialId}`,
    },
  };
  const result = await DocumentClient.get(params);
  return result.Item as Credential | undefined;
}

export async function queryCredentials(
  username: string
): Promise<Credential[] | undefined> {
  const params = {
    TableName: getAuthTableName(),
    KeyConditionExpression: "#pKey = :pKey and begins_with(#sKey, :sKey)",
    ExpressionAttributeNames: {
      "#pKey": "partitionKey",
      "#sKey": "sortKey",
    },
    ExpressionAttributeValues: {
      ":pKey": `user:${username}`,
      ":sKey": "credential:",
    },
  };
  const result = await DocumentClient.query(params);
  return result.Items as Credential[] | undefined;
}

export async function putCredential(
  username: string,
  credentialId: string,
  jwk: JWK,
  signCount: number,
  createdAt: Date
): Promise<boolean> {
  const item: Credential = {
    partitionKey: `user:${username}`,
    sortKey: `credential:${credentialId}`,
    username,
    credentialId,
    jwk,
    signCount: signCount,
    createdAt: createdAt.toISOString(),
    approved: false,
  };
  const putParams = { TableName: getAuthTableName(), Item: item };
  const result = await DocumentClient.put(putParams);
  return !!result.Attributes;
}

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

import * as AWS from "aws-sdk";

type GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;
type PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;
type QueryInput = AWS.DynamoDB.DocumentClient.QueryInput;

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

export function getGetCredentialInput(
  username: string,
  credentialId: string
): Omit<GetItemInput, "TableName"> {
  return {
    Key: {
      partitionKey: getPKey(username),
      sortKey: getSKey(credentialId),
    },
  };
}

export function getQueryCredentialsInput(
  username: string
): Omit<QueryInput, "TableName"> {
  return {
    KeyConditionExpression: "#pKey = :pKey and begins_with(#sKey, :sKey)",
    ExpressionAttributeNames: {
      "#pKey": "partitionKey",
      "#sKey": "sortKey",
    },
    ExpressionAttributeValues: {
      ":pKey": getPKey(username),
      ":sKey": getSKey(),
    },
  };
}

export function getPutCredentialInput(
  username: string,
  credentialId: string,
  jwk: JWK,
  signCount: number,
  createdAt: Date,
  approved: boolean = false
): Omit<PutItemInput, "TableName"> {
  const item: Credential = {
    partitionKey: getPKey(username),
    sortKey: getSKey(credentialId),
    username,
    credentialId,
    jwk,
    signCount: signCount,
    createdAt: createdAt.toISOString(),
    approved,
  };
  return { Item: item };
}

function getPKey(username: string) {
  return `user:${username}`;
}
function getSKey(credentialId?: string) {
  if (!credentialId) {
    return "credential:";
  }
  return `credential:${credentialId}`;
}

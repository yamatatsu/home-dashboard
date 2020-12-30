import { DocumentClient } from "./awsSdk";

export type SignUpChallenge = {
  partitionKey: string;
  sortKey: string;
  username: string;
  signUpChallenge: string;
  createdAt: string;
};
export type SignInChallenge = {
  partitionKey: string;
  sortKey: string;
  username: string;
  signInChallenge: string;
  createdAt: string;
};
export type Credential = {
  partitionKey: string;
  sortKey: string;
  username: string;
  credentialId: string;
  jwk: { kty: string; crv: string; x: string; y: string };
  signCount: number;
  createdAt: string;
};
export type JWK = { kty: string; crv: string; x: string; y: string };

export async function getSignUpChallenge(
  username: string,
  challenge: string
): Promise<SignUpChallenge | undefined> {
  const params = {
    TableName: getAuthTableName(),
    Key: {
      partitionKey: `user:${username}`,
      sortKey: `signUpChallenge:${challenge}`,
    },
  };
  console.info("It will be get. params: %o", params);
  const result = await DocumentClient.get(params);
  console.info("getSignUpChallenge: %o", result);
  return result.Item as SignUpChallenge | undefined;
}

export async function putSignUpChallenge(
  username: string,
  challenge: string,
  createdAt: Date
): Promise<boolean> {
  const signUpChallenge: SignUpChallenge = {
    partitionKey: `user:${username}`,
    sortKey: `signUpChallenge:${challenge}`,
    username,
    signUpChallenge: challenge,
    createdAt: createdAt.toISOString(),
  };
  const params = { TableName: getAuthTableName(), Item: signUpChallenge };
  console.info("It will be put. params: %o", params);
  const result = await DocumentClient.put(params);
  console.info("putSignUpChallenge: %o", result);
  return !!result.Attributes;
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
  console.info("It will be query. params: %o", params);
  const result = await DocumentClient.query(params);
  console.info("queryCredentials: %o", result);
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
  };
  const putParams = { TableName: getAuthTableName(), Item: item };
  console.info("It will be put. params: %o", putParams);
  const result = await DocumentClient.put(putParams);
  console.info("putCredential: %o", result);
  return !!result.Attributes;
}

export async function putSignInChallenge(
  username: string,
  challenge: string,
  createdAt: Date
): Promise<boolean> {
  const signInChallenge: SignInChallenge = {
    partitionKey: `user:${username}`,
    sortKey: `signInChallenge:${challenge}`,
    username,
    signInChallenge: challenge,
    createdAt: createdAt.toISOString(),
  };
  const params = { TableName: getAuthTableName(), Item: signInChallenge };
  console.info("It will be put. params: %o", params);
  const result = await DocumentClient.put(params);
  console.info("putSignInChallenge: %o", result);
  return !!result.Attributes;
}

function getAuthTableName() {
  const { AUTH_TABLE_NAME } = process.env;
  if (!AUTH_TABLE_NAME) {
    throw new Error("Enviroment variable `AUTH_TABLE_NAME` is required.");
  }
  return AUTH_TABLE_NAME;
}

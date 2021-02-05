import { AuthTableClient } from "./_repositoryBase";
import {
  Credential,
  PreCredential,
  verifyCredential,
} from "../models/credential";

export async function getCredential(
  username: string,
  credentialId: string
): Promise<Credential | undefined> {
  const result = await AuthTableClient.get({
    Key: {
      partitionKey: getPKey(username),
      sortKey: getSKey(credentialId),
    },
  });
  return verifyCredential(result.Item as PreCredential);
}

export async function queryCredentials(
  username: string
): Promise<Credential[]> {
  const result = await AuthTableClient.query({
    KeyConditionExpression: "#pKey = :pKey and begins_with(#sKey, :sKey)",
    ExpressionAttributeNames: {
      "#pKey": "partitionKey",
      "#sKey": "sortKey",
    },
    ExpressionAttributeValues: {
      ":pKey": getPKey(username),
      ":sKey": getSKey(),
    },
  });
  if (!result.Items) return [];
  return result.Items.map((item) => verifyCredential(item as PreCredential));
}

export async function putCredential(credential: Credential): Promise<void> {
  await AuthTableClient.put({
    Item: {
      partitionKey: getPKey(credential.username),
      sortKey: getSKey(credential.credentialId),
      ...credential,
    },
  });
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

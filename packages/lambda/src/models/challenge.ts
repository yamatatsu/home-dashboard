import * as AWS from "aws-sdk";
import { getTtl } from "./util";

type GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;
type PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;

export type Challenge = {
  partitionKey: string;
  sortKey: string;
  username: string;
  challenge: string;
  createdAt: string;
  ttl: number;
};

export function getGetSignUpChallengeInput(
  username: string,
  challenge: string
): Omit<GetItemInput, "TableName"> {
  return {
    Key: {
      partitionKey: getPKey(username),
      sortKey: getSignUpChallengeSKey(challenge),
    },
  };
}

export function getPutSignUpChallengeInput(
  username: string,
  challenge: string,
  createdAt: Date
): Omit<PutItemInput, "TableName"> {
  const item: Challenge = {
    partitionKey: getPKey(username),
    sortKey: getSignUpChallengeSKey(challenge),
    username,
    challenge: challenge,
    createdAt: createdAt.toISOString(),
    ttl: getTtl(createdAt, 1),
  };
  return { Item: item };
}

export function getGetSignInChallengeInput(
  username: string,
  challenge: string
): Omit<GetItemInput, "TableName"> {
  return {
    Key: {
      partitionKey: getPKey(username),
      sortKey: getSignInChallengeSKey(challenge),
    },
  };
}

export function getPutSignInChallengeInput(
  username: string,
  challenge: string,
  createdAt: Date
): Omit<PutItemInput, "TableName"> {
  const item: Challenge = {
    partitionKey: getPKey(username),
    sortKey: getSignInChallengeSKey(challenge),
    username,
    challenge: challenge,
    createdAt: createdAt.toISOString(),
    ttl: getTtl(createdAt, 1),
  };
  return { Item: item };
}

function getPKey(username: string) {
  return `user:${username}`;
}
function getSignUpChallengeSKey(challenge: string) {
  return `signUpChallenge:${challenge}`;
}
function getSignInChallengeSKey(challenge: string) {
  return `signInChallenge:${challenge}`;
}

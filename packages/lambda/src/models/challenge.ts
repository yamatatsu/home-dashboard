import * as AWS from "aws-sdk";

export type Challenge = {
  partitionKey: string;
  sortKey: string;
  username: string;
  challenge: string;
  createdAt: string;
};

export function getSignUpChallengeKey(
  username: string,
  challenge: string
): AWS.DynamoDB.DocumentClient.Key {
  return {
    partitionKey: getPKey(username),
    sortKey: getSignUpChallengeSKey(challenge),
  };
}

export function getSignUpChallengeRecord(
  username: string,
  challenge: string,
  createdAt: Date
): Challenge {
  return {
    partitionKey: getPKey(username),
    sortKey: getSignUpChallengeSKey(challenge),
    username,
    challenge: challenge,
    createdAt: createdAt.toISOString(),
  };
}

export function getSignInChallengeKey(
  username: string,
  challenge: string
): AWS.DynamoDB.DocumentClient.Key {
  return {
    partitionKey: getPKey(username),
    sortKey: getSignInChallengeSKey(challenge),
  };
}

export function getSignInChallengeRecord(
  username: string,
  challenge: string,
  createdAt: Date
): Challenge {
  return {
    partitionKey: getPKey(username),
    sortKey: getSignInChallengeSKey(challenge),
    username,
    challenge: challenge,
    createdAt: createdAt.toISOString(),
  };
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

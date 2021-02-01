import { AuthTableClient } from "./_repositoryBase";
import { Challenge, PreChallenge, verifyChallenge } from "./challenge";

export async function getSignUpChallenge(
  username: string,
  challenge: string
): Promise<Challenge | undefined> {
  const result = await AuthTableClient.get({
    Key: {
      partitionKey: getPKey(username),
      sortKey: getSignUpChallengeSKey(challenge),
    },
  });
  return verifyChallenge(result.Item as PreChallenge);
}

export async function putSignUpChallenge(challenge: Challenge): Promise<void> {
  await AuthTableClient.put({
    Item: {
      partitionKey: getPKey(challenge.username),
      sortKey: getSignUpChallengeSKey(challenge.challenge),
      ...challenge,
    },
  });
}

export async function getSignInChallenge(
  username: string,
  challenge: string
): Promise<Challenge | undefined> {
  const result = await AuthTableClient.get({
    Key: {
      partitionKey: getPKey(username),
      sortKey: getSignInChallengeSKey(challenge),
    },
  });
  return verifyChallenge(result.Item as PreChallenge);
}

export async function putSignInChallenge(challenge: Challenge): Promise<void> {
  await AuthTableClient.put({
    Item: {
      partitionKey: getPKey(challenge.username),
      sortKey: getSignInChallengeSKey(challenge.challenge),
      ...challenge,
    },
  });
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

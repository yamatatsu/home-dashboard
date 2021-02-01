import * as z from "zod";
import { getTtl } from "./util";

export type PreChallenge = {
  username: string;
  challenge: string;
  createdAt: string;
  ttl: number;
};

export type Challenge = {
  __verified__: "Model:Challenge";
} & PreChallenge;

const schema = z.object({
  username: z.string(),
  challenge: z.string(),
  createdAt: z.string(),
  ttl: z.number(),
});

export function createChallenge(
  username: string,
  challenge: string,
  createdAt: Date
): Challenge {
  return verifyChallenge({
    username,
    challenge: challenge,
    createdAt: createdAt.toISOString(),
    ttl: getTtl(createdAt, 1),
  });
}

export function verifyChallenge(challenge: PreChallenge): Challenge {
  const item: PreChallenge = schema.parse(challenge);
  return item as Challenge;
}

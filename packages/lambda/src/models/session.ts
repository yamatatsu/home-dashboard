import * as z from "zod";
import { getTtl } from "./util";

export type PreSession = {
  sessionId: string;
  username: string;
  ttl: number;
  createdAt: string;
};
export type Session = { __verified__: "Model:Session" } & PreSession;

const schema = z
  .object({
    sessionId: z.string(),
    username: z.string(),
    ttl: z.number(),
    createdAt: z.string(),
  })
  .nonstrict();

export function createSession(
  sessionId: string,
  username: string,
  createdAt: Date
): Session {
  return verifySession({
    sessionId,
    username,
    ttl: getTtl(createdAt, 12),
    createdAt: createdAt.toISOString(),
  });
}

export function verifySession(session: PreSession): Session {
  const item: PreSession = schema.parse(session);
  return item as Session;
}

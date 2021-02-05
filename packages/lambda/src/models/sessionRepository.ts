import { AuthTableClient } from "./_repositoryBase";
import { Session, PreSession, verifySession } from "../models/session";

export async function getSession(
  sessionId: string
): Promise<Session | undefined> {
  const result = await AuthTableClient.get({
    Key: {
      partitionKey: getKey(sessionId),
      sortKey: getKey(sessionId),
    },
  });
  return verifySession(result.Item as PreSession);
}

export async function putSession(session: Session): Promise<void> {
  await AuthTableClient.put({
    Item: {
      partitionKey: getKey(session.sessionId),
      sortKey: getKey(session.sessionId),
      ...session,
    },
  });
}

function getKey(sessionId: string) {
  return `session:${sessionId}`;
}

jest.mock("../lib/db");

import authorize from "./authorize";
import { getSession } from "../lib/db";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  // console.info = jest.fn();
});
afterEach(() => {
  // @ts-expect-error
  getSession.mockClear();
});

// TODO: Happy path only...

test("Success pattern", async () => {
  process.env = { ...process.env, MAIN_TABLE_NAME: "test-MAIN_TABLE_NAME" };

  const mockGetSession = getSession as jest.Mock<any, any>;
  mockGetSession.mockReturnValueOnce({
    partitionKey: "session:test-sessionId",
    sortKey: "session:test-sessionId",
    sessionId: "test-sessionId",
    username: "test-username",
    ttl: 1609984974,
    createdAt: "2021-01-06T14:03:16.555Z",
  });

  const result = await authorize({
    headers: { "x-hd-auth": "test-sessionId" },
  });

  expect(mockGetSession).toHaveBeenCalledTimes(1);
  expect(mockGetSession).toHaveBeenNthCalledWith(1, "test-sessionId");

  expect(result).toStrictEqual({
    isAuthorized: true,
    context: { username: "test-username" },
  });
});

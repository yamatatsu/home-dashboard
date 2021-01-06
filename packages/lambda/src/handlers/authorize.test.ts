jest.mock("../lib/awsSdk");

import authorize from "./authorize";
import { AuthTableClient } from "../lib/awsSdk";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  // console.info = jest.fn();
});
afterEach(() => {
  // @ts-expect-error
  AuthTableClient.get.mockClear();
});

// TODO: Happy path only...

test("Success pattern", async () => {
  process.env = { ...process.env, MAIN_TABLE_NAME: "test-MAIN_TABLE_NAME" };

  const mockGet = AuthTableClient.get as jest.Mock<any, any>;
  mockGet.mockReturnValueOnce({
    Item: {
      partitionKey: "session:test-sessionId",
      sortKey: "session:test-sessionId",
      sessionId: "test-sessionId",
      username: "test-username",
      ttl: 1609984974,
      createdAt: "2021-01-06T14:03:16.555Z",
    },
  });

  const result = await authorize({
    headers: { "x-hd-auth": "test-sessionId" },
  });

  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockGet).toHaveBeenNthCalledWith(1, {
    Key: {
      partitionKey: "session:test-sessionId",
      sortKey: "session:test-sessionId",
    },
  });

  expect(result).toStrictEqual({
    isAuthorized: true,
    context: { username: "test-username" },
  });
});

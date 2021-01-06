jest.mock("../lib/awsSdk");

import signInChallenge from "./signInChallenge";
import { AuthTableClient } from "../lib/awsSdk";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  console.info = jest.fn();
});
afterEach(() => {
  // @ts-expect-error
  AuthTableClient.put.mockClear();
});

// TODO: Happy path only...

test("Success pattern", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  (AuthTableClient.query as jest.Mock<any, any>).mockReturnValue({
    Items: [
      {
        partitionKey: "user:test-username",
        sortKey: "credential:test-credentialId",
        username: "test-username",
        credentialId: "test-credentialId",
        jwk: { kty: "test-kty", crv: "test-crv", x: "test-x", y: "test-y" },
        signCount: 100,
        createdAt: "test-createdAt",
      },
    ],
  });

  const result = await signInChallenge(
    { body: JSON.stringify({ username: "test-username" }) },
    date
  );

  expect(AuthTableClient.query).toHaveBeenCalledTimes(1);
  expect(AuthTableClient.query).toHaveBeenCalledWith({
    KeyConditionExpression: "#pKey = :pKey and begins_with(#sKey, :sKey)",
    ExpressionAttributeNames: {
      "#pKey": "partitionKey",
      "#sKey": "sortKey",
    },
    ExpressionAttributeValues: {
      ":pKey": "user:test-username",
      ":sKey": "credential:",
    },
  });
  expect(AuthTableClient.put).toHaveBeenCalledTimes(1);
  expect(AuthTableClient.put).toHaveBeenCalledWith({
    Item: {
      partitionKey: "user:test-username",
      sortKey: expect.stringMatching(/^signInChallenge\:/),
      username: "test-username",
      challenge: expect.any(String),
      createdAt: "2020-12-23T00:00:00.000Z",
      ttl: 1608685200,
    },
  });
  expect(result).toStrictEqual({
    statusCode: 201,
    body: expect.any(String),
  });
  expect(JSON.parse(result.body ?? "")).toStrictEqual({
    challenge: expect.any(String),
    credentialIds: ["test-credentialId"],
  });
});

jest.mock("./lib/db");

import signInChallenge from "./signInChallenge";
import { queryCredentials, putSignInChallenge } from "./lib/db";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  console.info = jest.fn();
});
afterEach(() => {
  // @ts-ignore
  queryCredentials.mockClear();
  // @ts-ignore
  putSignInChallenge.mockClear();
});

// TODO: Happy path only...

test("Success pattern", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  (queryCredentials as jest.Mock<any, any>).mockReturnValue([
    {
      partitionKey: "user:test-username",
      sortKey: "credential:test-credentialId",
      username: "test-username",
      credentialId: "test-credentialId",
      jwk: { kty: "test-kty", crv: "test-crv", x: "test-x", y: "test-y" },
      signCount: 100,
      createdAt: "test-createdAt",
    },
  ]);

  const result = await signInChallenge(
    { body: JSON.stringify({ username: "test-username" }) },
    date
  );

  expect(queryCredentials).toHaveBeenCalledTimes(1);
  expect(queryCredentials).toHaveBeenCalledWith("test-username");
  expect(putSignInChallenge).toHaveBeenCalledTimes(1);
  expect(putSignInChallenge).toHaveBeenCalledWith(
    "test-username",
    expect.any(String),
    date
  );
  expect(result).toStrictEqual({
    statusCode: 201,
    body: expect.any(String),
  });
  expect(JSON.parse(result.body ?? "")).toStrictEqual({
    challenge: expect.any(String),
    credentialIds: ["test-credentialId"],
  });
});

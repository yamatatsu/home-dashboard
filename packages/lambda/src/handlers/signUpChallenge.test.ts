jest.mock("../lib/awsSdk");

import signUpChallenge from "./signUpChallenge";
import { AuthTableClient } from "../lib/awsSdk";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  console.info = jest.fn();
});
afterEach(() => {
  // @ts-expect-error
  AuthTableClient.put.mockClear();
});

test("thrown if no body", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  await expect(signUpChallenge({}, date)).resolves.toStrictEqual({
    body: expect.stringMatching(/invalid_type at body/),
    statusCode: 400,
  });
});
test("thrown if no username", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  await expect(
    signUpChallenge({ body: JSON.stringify({}) }, date)
  ).resolves.toStrictEqual({
    body: expect.stringMatching(/invalid_type at username/),
    statusCode: 400,
  });
});
test("thrown if empty username", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  await expect(
    signUpChallenge({ body: JSON.stringify({ username: "" }) }, date)
  ).resolves.toStrictEqual({
    body: expect.stringMatching(/too_small at username/),
    statusCode: 400,
  });
});
test("thrown if username length is less than 2", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  await expect(
    signUpChallenge({ body: JSON.stringify({ username: "a" }) }, date)
  ).resolves.toStrictEqual({
    body: expect.stringMatching(/too_small at username/),
    statusCode: 400,
  });
});
test("thrown if username length is more than 100", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };
  const len101 =
    "_________1_________2_________3_________4_________5_________6_________7_________8_________9________10_";

  await expect(
    signUpChallenge({ body: JSON.stringify({ username: len101 }) }, date)
  ).resolves.toStrictEqual({
    body: expect.stringMatching(/too_big at username/),
    statusCode: 400,
  });
});

test("thrown if username length is 2", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  await expect(
    signUpChallenge({ body: JSON.stringify({ username: "aa" }) }, date)
  ).resolves.not.toThrow();
});

test("not thrown if username length is 100", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };
  const len100 =
    "_________1_________2_________3_________4_________5_________6_________7_________8_________9________10";

  await expect(
    signUpChallenge({ body: JSON.stringify({ username: len100 }) }, date)
  ).resolves.not.toThrow();
});

test("Success pattern", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  const result = await signUpChallenge(
    { body: JSON.stringify({ username: "test-username" }) },
    date
  );

  expect(AuthTableClient.put).toHaveBeenCalledTimes(1);
  expect(AuthTableClient.put).toHaveBeenCalledWith({
    Item: {
      partitionKey: "user:test-username",
      sortKey: expect.stringMatching(/^signUpChallenge\:/),
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
  });
});

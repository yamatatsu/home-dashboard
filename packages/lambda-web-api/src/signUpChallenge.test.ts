jest.mock("./lib/db");

import signUpChallenge from "./signUpChallenge";
import { putSignUpChallenge } from "./lib/db";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  console.info = jest.fn();
});
afterEach(() => {
  // @ts-ignore
  putSignUpChallenge.mockClear();
});

test("throw if env AUTH_TABLE_NAME is undefined", async () => {
  await expect(signUpChallenge({}, date)).rejects.toThrow(
    "Enviroment variable `AUTH_TABLE_NAME` is required."
  );
});
test("thrown if no body", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  await expect(signUpChallenge({}, date)).resolves.toStrictEqual({
    body: expect.stringMatching(/body is a required field/),
    statusCode: 400,
  });
});
test("thrown if no username", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  await expect(
    signUpChallenge({ body: JSON.stringify({}) }, date)
  ).resolves.toStrictEqual({
    body: expect.stringMatching(/username is a required field/),
    statusCode: 400,
  });
});
test("thrown if empty username", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  await expect(
    signUpChallenge({ body: JSON.stringify({ username: "" }) }, date)
  ).resolves.toStrictEqual({
    body: expect.stringMatching(/username is a required field/),
    statusCode: 400,
  });
});
test("thrown if username length is less than 2", async () => {
  process.env = { ...process.env, AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME" };

  await expect(
    signUpChallenge({ body: JSON.stringify({ username: "a" }) }, date)
  ).resolves.toStrictEqual({
    body: expect.stringMatching(/username must be at least 2 characters/),
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
    body: expect.stringMatching(/username must be at most 100 characters/),
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

  expect(putSignUpChallenge).toHaveBeenCalledTimes(1);
  expect(putSignUpChallenge).toHaveBeenCalledWith(
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
  });
});

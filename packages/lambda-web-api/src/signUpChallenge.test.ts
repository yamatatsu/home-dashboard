jest.mock("./awsSdk");

import { TextEncoder } from "util";
import signUpChallenge from "./signUpChallenge";
import { DocumentClient } from "./awsSdk";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  console.info = jest.fn();
});
afterEach(() => {
  // @ts-ignore
  DocumentClient.put.mockClear();
});

test("thrown if no body", async () => {
  await expect(signUpChallenge({}, date)).rejects.toThrow(
    "body is a required field"
  );
});
test("thrown if no username", async () => {
  await expect(
    signUpChallenge({ body: JSON.stringify({}) }, date)
  ).rejects.toThrow("username is a required field");
});
test("thrown if empty username", async () => {
  await expect(
    signUpChallenge({ body: JSON.stringify({ username: "" }) }, date)
  ).rejects.toThrow("username is a required field");
});
test("thrown if username length is less than 2", async () => {
  await expect(
    signUpChallenge({ body: JSON.stringify({ username: "a" }) }, date)
  ).rejects.toThrow("username must be at least 2 characters");
});
test("thrown if username length is more than 100", async () => {
  await expect(
    signUpChallenge(
      {
        body: JSON.stringify({
          username:
            "_________1_________2_________3_________4_________5_________6_________7_________8_________9________10_",
        }),
      },
      date
    )
  ).rejects.toThrow("username must be at most 100 characters");
});

test("thrown if username length is 2", async () => {
  await expect(
    signUpChallenge({ body: JSON.stringify({ username: "aa" }) }, date)
  ).resolves.not.toThrow();
});
test("not thrown if username length is 100", async () => {
  await expect(
    signUpChallenge(
      {
        body: JSON.stringify({
          username:
            "_________1_________2_________3_________4_________5_________6_________7_________8_________9________10",
        }),
      },
      date
    )
  ).resolves.not.toThrow();
});

test("Success pattern", async () => {
  const result = await signUpChallenge(
    { body: JSON.stringify({ username: "test-username" }) },
    date
  );

  expect(DocumentClient.put).toHaveBeenCalledTimes(1);
  expect(DocumentClient.put).toHaveBeenCalledWith({
    TableName: "auth",
    Item: {
      partitionKey: "username:test-username",
      sortKey: expect.any(String),
      challenge: expect.any(String),
      username: "test-username",
      createdAt: date,
    },
  });

  expect(result).toStrictEqual({
    statusCode: 201,
    body: expect.any(String),
  });
  expect(JSON.parse(result.body ?? "")).toStrictEqual({
    publicKeyOptions: {
      challenge: expect.any(String),
      attestation: "direct",
      authenticatorSelection: {
        requireResidentKey: false,
        userVerification: "preferred",
      },
      rp: { name: "FIDO Examples Corporation" },
      user: {
        id: "test-username",
        name: "test-username",
        displayName: "test-username",
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    },
  });
});

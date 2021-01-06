jest.mock("../lib/awsSdk");

import signIn from "./signIn";
import { AuthTableClient } from "../lib/awsSdk";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  console.info = jest.fn();
});
afterEach(() => {
  // @ts-expect-error
  AuthTableClient.get.mockClear();
  // @ts-expect-error
  AuthTableClient.put.mockClear();
});

// TODO: Happy path only...

test("Success pattern", async () => {
  process.env = {
    ...process.env,
    AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME",
    ALLOW_ORIGINS: "http://localhost:1234",
    RP_ID: "localhost",
  };

  const getMock = AuthTableClient.get as jest.Mock<any, any>;
  const putMock = AuthTableClient.put as jest.Mock<any, any>;
  getMock.mockReturnValueOnce({ Item: {} });
  getMock.mockReturnValueOnce({
    Item: {
      partitionKey: "user:aaa",
      sortKey:
        "credential:AXVt4yC1ssWMc43aM0MwS6otv0MvnpiHFVD7eg6U7MIbJftdBxzqhP3g",
      username: "aaa",
      credentialId: "AXVt4yC1ssWMc43aM0MwS6otv0MvnpiHFVD7eg6U7MIbJftdBxzqhP3g",
      jwk: {
        kty: "EC",
        crv: "P-256",
        x: "TwjbjplwEwfDDPFDSCuenj1WO2aXJth8syaZ5n5fRhE",
        y: "9CVJGAS0RrLkd5vlDwzCU2D4l_oUSEUiDQPPC3_xego",
      },
      signCount: "1609289710",
      createdAt: "2020-12-30T00:55:13.045Z",
      approved: true,
    },
  });

  const result = await signIn(
    {
      body: JSON.stringify({
        username: "test-username",
        credential: {
          id: "test-credentialId",
          response: {
            authenticatorData:
              "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MFX-vybw",
            clientDataJSON:
              "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiSkU5OW5MdEIxY1RFalZvWk9aQlRGLXphcFF3Q0ZxQmpfVk5mZ0h2V2dIb1JRUmotNHZzQzgwNHA5QktwcG55WG5vRlUzUEp0TFU2M21HanFkM0t6ZEk1R0dlamxTMlpnSHZ4aHdybEg4TXRMa1h2YWxzOXdUMzVqSEZVd1lMRE9JZng1T09DQ29OUENHZ2RmUDZhQ0VkMXphS2R1VFMyb1BJcEpLODBSdXRFIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDoxMjM0IiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
            signature:
              "MEQCIHMNzFwfAywA_j_qiTeizfGMXdSyCE_RaFsC82HwAsAgAiBYdNea0jWzYE32oaMIFkPYrbqVbE_p3qzCFcut1Y8WUw",
            userHandle: "aaY",
          },
        },
      }),
    },
    date
  );

  expect(getMock).toHaveBeenCalledTimes(2);
  expect(getMock).toHaveBeenNthCalledWith(1, {
    Key: {
      partitionKey: "user:test-username",
      sortKey: expect.stringMatching(/^signInChallenge\:/),
    },
  });
  expect(getMock).toHaveBeenNthCalledWith(2, {
    Key: {
      partitionKey: "user:test-username",
      sortKey: "credential:test-credentialId",
    },
  });
  expect(putMock).toHaveBeenCalledTimes(2);
  expect(putMock).toHaveBeenNthCalledWith(1, {
    Item: {
      partitionKey: "user:test-username",
      sortKey: "credential:test-credentialId",
      username: "test-username",
      credentialId: "test-credentialId",
      jwk: {
        crv: "P-256",
        kty: "EC",
        x: "TwjbjplwEwfDDPFDSCuenj1WO2aXJth8syaZ5n5fRhE",
        y: "9CVJGAS0RrLkd5vlDwzCU2D4l_oUSEUiDQPPC3_xego",
      },
      signCount: 1609298543,
      createdAt: "2020-12-23T00:00:00.000Z",
      approved: false,
    },
  });
  expect(putMock).toHaveBeenNthCalledWith(2, {
    Item: {
      partitionKey: expect.stringMatching(/^session\:/),
      sortKey: expect.stringMatching(/^session\:/),
      sessionId: expect.any(String),
      username: "test-username",
      createdAt: "2020-12-23T00:00:00.000Z",
      ttl: 1608724800,
    },
  });

  expect(result).toStrictEqual({
    statusCode: 201,
    body: expect.any(String),
    cookies: [
      expect.stringMatching(
        /^sessionId\=.+\; Max\-Age\=60\; HttpOnly\; Secure\; SameSite\=None$/
      ),
    ],
  });
  expect(JSON.parse(result.body ?? "")).toStrictEqual({
    sessionId: expect.any(String),
  });
});

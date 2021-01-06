jest.mock("../lib/awsSdk");

import signUp from "./signUp";
import { AuthTableClient } from "../lib/awsSdk";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  // console.info = jest.fn();
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

  (AuthTableClient.get as jest.Mock<any, any>).mockReturnValue({ Item: {} }); // not undefined

  const result = await signUp(
    {
      body: JSON.stringify({
        username: "test-username",
        credential: {
          id: "test-credentialId",
          response: {
            attestationObject:
              "o2NmbXRmcGFja2VkZ2F0dFN0bXSiY2FsZyZjc2lnWEcwRQIhAIDJfzLWIcsMBA73UCoLBgeYkvFGPBtC_vvCFV98r02iAiBm-rSeUoB2rKX16BVy1uLtYF-26BqixPZosWV8lixmamhhdXRoRGF0YVirSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NFX-rUVa3OAAI1vMYKZIsLJfHwVQMAJwFW1OsV1zrFs7A7r1_DuWJXmc-ak3A8CQ6w5TQ8STKvnegrGuFfwaUBAgMmIAEhWCBcxib1criES3zt6Y2-9-3C-PAnrQ6qXdLZTFhH7OIp-SJYIGkR4b3hRwtEP5srIh-iN5_XEIR1HXr1kmHzKaturp2l",
            clientDataJSON:
              "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWUhRWnFJRzdpckV5RUo0ZFVsOGlsVThXVXJCYlFEUjhpREJZY3lSRHJfbHlyZUtraWZBMzJJWll1Mm1lLUdqemRlaGpkNEZMMVd5OFV0SDlhWjBlOFp1ZUs5ZXp3SzU2anJXaUUwTnM5NmJOYmphZFJmRTctS2Q3MjJ0aWtGQ0NsaEtHRTBNOTlCVHR6cU1ZY2R1emdWVi1UaU9GWVNTZWJ1RWlnRzZFd2VrIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDoxMjM0IiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
          },
        },
      }),
    },
    date
  );

  expect(AuthTableClient.get).toHaveBeenCalledTimes(1);
  expect(AuthTableClient.get).toHaveBeenCalledWith({
    Key: {
      partitionKey: "user:test-username",
      sortKey: expect.stringMatching(/^signUpChallenge\:/),
    },
  });
  expect(AuthTableClient.put).toHaveBeenCalledTimes(1);
  expect(AuthTableClient.put).toHaveBeenCalledWith({
    Item: {
      partitionKey: "user:test-username",
      sortKey: "credential:test-credentialId",
      username: "test-username",
      credentialId: "test-credentialId",
      jwk: {
        crv: "P-256",
        kty: "EC",
        x: "XMYm9XK4hEt87emNvvftwvjwJ60Oql3S2UxYR-ziKfk",
        y: "aRHhveFHC0Q_mysiH6I3n9cQhHUdevWSYfMpq26unaU",
      },
      signCount: 1609225301,
      createdAt: "2020-12-23T00:00:00.000Z",
      approved: false,
    },
  });

  expect(result).toStrictEqual({
    statusCode: 201,
    body: expect.any(String),
  });
  expect(JSON.parse(result.body ?? "")).toStrictEqual({});
});

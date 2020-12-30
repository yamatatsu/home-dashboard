jest.mock("./lib/db");

import signUp from "./signUp";
import { getSignUpChallenge, putCredential } from "./lib/db";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  // console.info = jest.fn();
});
afterEach(() => {
  // @ts-expect-error
  getSignUpChallenge.mockClear();
  // @ts-expect-error
  putCredential.mockClear();
});

// TODO: Happy path only...

test("Success pattern", async () => {
  process.env = {
    ...process.env,
    AUTH_TABLE_NAME: "test-AUTH_TABLE_NAME",
    ALLOW_ORIGINS: "http://localhost:1234",
    RP_ID: "localhost",
  };

  (getSignUpChallenge as jest.Mock<any, any>).mockReturnValue({}); // not undefined

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

  expect(getSignUpChallenge).toHaveBeenCalledTimes(1);
  expect(getSignUpChallenge).toHaveBeenCalledWith(
    "test-username",
    expect.any(String)
  );
  expect(putCredential).toHaveBeenCalledTimes(1);
  expect(putCredential).toHaveBeenCalledWith(
    "test-username",
    "test-credentialId",
    {
      crv: "P-256",
      kty: "EC",
      x: expect.any(String),
      y: expect.any(String),
    },
    1609225301,
    date
  );

  expect(result).toStrictEqual({
    statusCode: 201,
    body: expect.any(String),
  });
  expect(JSON.parse(result.body ?? "")).toStrictEqual({});
});

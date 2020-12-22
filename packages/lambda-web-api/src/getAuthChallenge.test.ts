import getAuthChallenge from "./getAuthChallenge";

test("response shape", async () => {
  const result = await getAuthChallenge();
  expect(result).toStrictEqual({
    statusCode: 201,
    body: expect.any(String),
  });
});

test("body shape", async () => {
  const result = await getAuthChallenge();
  const body = JSON.parse(result.body ?? "");
  expect(body).toStrictEqual({
    challenge: expect.any(String),
  });
});

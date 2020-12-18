jest.mock("node-fetch");
jest.mock("./awsSdk");

import fetch from "node-fetch";
import fetchRemoApi from "./fetchRemoApi";
import { SNS } from "./awsSdk";

const { Response } = jest.requireActual("node-fetch");

describe("fetchRemoApi", () => {
  let publishSpy: jest.Mock;

  beforeAll(() => {
    // @ts-ignore
    fetch.mockReturnValue(Promise.resolve(new Response("test-Response")));
    publishSpy = jest.fn();
    SNS.publish = publishSpy;
  });

  // TODO: name of tests

  test("Throw if no REMO_TOKEN is passed.", async () => {
    await expect(fetchRemoApi()).rejects.toThrow(
      "Enviroment variable `REMO_TOKEN` is required."
    );
  });
  test("Throw if no TOPIC_ARN is passed.", async () => {
    process.env = {
      ...process.env,
      REMO_TOKEN: "test-REMO_TOKEN",
    };
    await expect(fetchRemoApi()).rejects.toThrow(
      "Enviroment variable `TOPIC_ARN` is required."
    );
  });
  test("Success", async () => {
    process.env = {
      ...process.env,
      REMO_TOKEN: "test-REMO_TOKEN",
      TOPIC_ARN: "test-TOPIC_ARN",
    };

    await expect(fetchRemoApi()).resolves.toBeUndefined();

    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(publishSpy).toHaveBeenCalledWith({
      TopicArn: "test-TOPIC_ARN",
      Message: "test-Response",
    });
  });
});

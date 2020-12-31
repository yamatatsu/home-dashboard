jest.mock("node-fetch");
jest.mock("../lib/awsSdk");

import fetch from "node-fetch";
import fetchRemoApi from "./fetchRemoApi";
import { SNS } from "../lib/awsSdk";

const { Response } = jest.requireActual("node-fetch");

describe("fetchRemoApi", () => {
  beforeEach(() => {
    console.info = jest.fn();
    console.timeEnd = jest.fn();

    // @ts-ignore
    fetch.mockReturnValue(Promise.resolve(new Response("test-Response")));
  });

  // TODO: name of tests

  test("Throw if env REMO_TOKEN is undefined.", async () => {
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

    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith(
      "A SQS message will send as `%s`",
      "test-Response"
    );
    expect(SNS.publish).toHaveBeenCalledTimes(1);
    expect(SNS.publish).toHaveBeenCalledWith({
      TopicArn: "test-TOPIC_ARN",
      Message: "test-Response",
    });
  });
});

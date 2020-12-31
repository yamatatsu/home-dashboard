jest.mock("../lib/awsSdk");

import backupRemoData from "./backupRemoData";
import { S3 } from "../lib/awsSdk";

describe("backupRemoData", () => {
  const date = new Date("2020/12/17 00:00:00Z");

  beforeEach(() => {
    console.info = jest.fn();
  });

  test("throw error if env BUCKET_NAME is undefined.", async () => {
    const message = JSON.stringify({
      MessageId: "test-MessageId",
      Message: '["test-Message-1"]',
    });
    await expect(backupRemoData(message, date)).rejects.toThrow(
      "Enviroment variable `BUCKET_NAME` is required."
    );
  });

  test("throw error if message is empty.", async () => {
    process.env = { ...process.env, BUCKET_NAME: "test-BUCKET_NAME" };
    await expect(backupRemoData("", date)).rejects.toThrow(
      "Unexpected end of JSON input"
    );
  });

  test("RemoData is saved.", async () => {
    process.env = { ...process.env, BUCKET_NAME: "test-BUCKET_NAME" };
    const message = JSON.stringify({
      MessageId: "test-MessageId",
      Message: '["test-Message-1"]',
    });
    const putObjectSpy = jest.fn();
    S3.putObject = putObjectSpy;
    await expect(backupRemoData(message, date)).resolves.toBeUndefined();

    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith("messageBody: %s", message);
    expect(putObjectSpy).toHaveBeenCalledTimes(1);
    expect(putObjectSpy).toHaveBeenCalledWith({
      Bucket: "test-BUCKET_NAME",
      Key: "test-MessageId",
      Body: '["test-Message-1"]',
      Expires: new Date("2020/12/18 00:00:00Z"),
    });
  });
});

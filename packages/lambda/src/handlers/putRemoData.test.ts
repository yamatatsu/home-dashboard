jest.mock("../lib/awsSdk");

import putRemoData from "./putRemoData";
import { DocumentClient } from "../lib/awsSdk";

const Message = JSON.stringify([
  {
    name: "Room1",
    id: "test-device-id-1",
    created_at: "2020-12-10T05:26:22Z",
    updated_at: "2020-12-17T09:16:49Z",
    mac_address: "test-mac_address1",
    serial_number: "test-serial_number",
    firmware_version: "test-firmware_version",
    temperature_offset: 0,
    humidity_offset: 0,
    users: [{ id: "test-user-id", nickname: "test-nickname", superuser: true }],
    newest_events: {
      te: { val: 13.1, created_at: "2020-12-17T15:01:54Z" },
    },
  },
  {
    name: "Room2",
    id: "test-device-id-2",
    created_at: "2020-12-02T11:35:41Z",
    updated_at: "2020-12-17T09:34:38Z",
    mac_address: "mac_address2",
    serial_number: "test-serial_number",
    firmware_version: "test-firmware_version",
    temperature_offset: 0,
    humidity_offset: 0,
    users: [{ id: "test-user-id", nickname: "test-nickname", superuser: true }],
    newest_events: {
      hu: { val: 36, created_at: "2020-12-17T15:13:48Z" },
      il: { val: 21, created_at: "2020-12-17T11:08:21Z" },
      mo: { val: 1, created_at: "2020-12-17T15:25:58Z" },
      te: { val: 17.4, created_at: "2020-12-17T15:13:08Z" },
    },
  },
]);
const testMessage = JSON.stringify({ MessageId: "test-MessageId", Message });

describe("putRemoData", () => {
  beforeEach(() => {
    console.info = jest.fn();
    console.warn = jest.fn();
  });

  const date = new Date("2020/12/17 00:00:00Z");

  test("throw error if env MAIN_TABLE_NAME is undefined.", async () => {
    await expect(putRemoData(testMessage, date)).rejects.toThrow(
      "Enviroment variable `MAIN_TABLE_NAME` is required."
    );
  });

  test("throw error if message is empty.", async () => {
    process.env = { ...process.env, MAIN_TABLE_NAME: "test-table-name" };
    await expect(putRemoData("", date)).rejects.toThrow(
      "Unexpected end of JSON input"
    );
  });
  test("Success if Empty data.", async () => {
    process.env = { ...process.env, MAIN_TABLE_NAME: "test-table-name" };
    const message = JSON.stringify({
      MessageId: "test-MessageId",
      Message: "[]",
    });
    await expect(putRemoData(message, date)).resolves.toBeUndefined();

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith("SQS Message is empty array.");
  });

  // TODO: validation test

  test("RemoData is saved.", async () => {
    process.env = { ...process.env, MAIN_TABLE_NAME: "test-table-name" };
    await expect(putRemoData(testMessage, date)).resolves.toBeUndefined();

    const expected = {
      RequestItems: {
        "test-table-name": [
          {
            PutRequest: {
              Item: {
                partitionKey: "deviceId:test-device-id-1",
                sortKey: "eventType:te|createdAt:2020-12-17T15:01:54Z",
                deviceId: "test-device-id-1",
                deviceName: "Room1",
                eventType: "te",
                value: 13.1,
                createdAt: "2020-12-17T15:01:54Z",
                ttl: 1608422400,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                partitionKey: "deviceId:test-device-id-2",
                sortKey: "eventType:hu|createdAt:2020-12-17T15:13:48Z",
                deviceId: "test-device-id-2",
                deviceName: "Room2",
                eventType: "hu",
                value: 36,
                createdAt: "2020-12-17T15:13:48Z",
                ttl: 1608422400,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                partitionKey: "deviceId:test-device-id-2",
                sortKey: "eventType:il|createdAt:2020-12-17T11:08:21Z",
                deviceId: "test-device-id-2",
                deviceName: "Room2",
                eventType: "il",
                value: 21,
                createdAt: "2020-12-17T11:08:21Z",
                ttl: 1608422400,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                partitionKey: "deviceId:test-device-id-2",
                sortKey: "eventType:mo|createdAt:2020-12-17T15:25:58Z",
                deviceId: "test-device-id-2",
                deviceName: "Room2",
                eventType: "mo",
                value: 1,
                createdAt: "2020-12-17T15:25:58Z",
                ttl: 1608422400,
              },
            },
          },
          {
            PutRequest: {
              Item: {
                partitionKey: "deviceId:test-device-id-2",
                sortKey: "eventType:te|createdAt:2020-12-17T15:13:08Z",
                deviceId: "test-device-id-2",
                deviceName: "Room2",
                eventType: "te",
                value: 17.4,
                createdAt: "2020-12-17T15:13:08Z",
                ttl: 1608422400,
              },
            },
          },
        ],
      },
    };

    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith("messageBody: %s", testMessage);
    // TODO: use snapshot test
    expect(DocumentClient.batchWrite).toHaveBeenCalledTimes(1);
    expect(DocumentClient.batchWrite).toHaveBeenCalledWith(expected);
  });
});

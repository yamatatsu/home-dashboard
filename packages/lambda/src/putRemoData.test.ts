jest.mock("./awsSdk");

import putRemoData from "./putRemoData";
import { DocumentClient } from "./awsSdk";

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
  // TODO: name of tests

  const date = new Date("2020/12/17 00:00:00Z");
  test("", async () => {
    await expect(putRemoData("", date)).rejects.toThrow(
      "Unexpected end of JSON input"
    );
  });
  test("Success if Empty data.", async () => {
    const message = JSON.stringify({
      MessageId: "test-MessageId",
      Message: "[]",
    });
    await expect(putRemoData(message, date)).resolves.toBeUndefined();
  });

  // TODO: validation test

  test("throw error that env is needed.", async () => {
    await expect(putRemoData(testMessage, date)).rejects.toThrow(
      "Enviroment variable `TABLE_NAME` is required."
    );
  });

  test("RemoData is saved.", async () => {
    process.env = { ...process.env, TABLE_NAME: "test-table-name" };
    const batchWriteSpy = jest.fn();
    DocumentClient.batchWrite = batchWriteSpy;
    await expect(putRemoData(testMessage, date)).resolves.toBeUndefined();

    // TODO: use snapshot test
    expect(batchWriteSpy.mock.calls).toEqual([
      [
        {
          RequestItems: {
            "test-table-name": [
              {
                PutRequest: {
                  Item: {
                    createdAt: "2020-12-17T15:01:54Z",
                    deviceId: "test-device-id-1",
                    deviceName: "Room1",
                    partitionKey: "remoEvent:test-device-id-1_te",
                    sortKey: "2020-12-17T15:01:54Z",
                    ttl: 1608184800,
                    type: "te",
                    value: 13.1,
                  },
                },
              },
              {
                PutRequest: {
                  Item: {
                    createdAt: "2020-12-17T15:13:48Z",
                    deviceId: "test-device-id-2",
                    deviceName: "Room2",
                    partitionKey: "remoEvent:test-device-id-2_hu",
                    sortKey: "2020-12-17T15:13:48Z",
                    ttl: 1608184800,
                    type: "hu",
                    value: 36,
                  },
                },
              },
              {
                PutRequest: {
                  Item: {
                    createdAt: "2020-12-17T11:08:21Z",
                    deviceId: "test-device-id-2",
                    deviceName: "Room2",
                    partitionKey: "remoEvent:test-device-id-2_il",
                    sortKey: "2020-12-17T11:08:21Z",
                    ttl: 1608184800,
                    type: "il",
                    value: 21,
                  },
                },
              },
              {
                PutRequest: {
                  Item: {
                    createdAt: "2020-12-17T15:25:58Z",
                    deviceId: "test-device-id-2",
                    deviceName: "Room2",
                    partitionKey: "remoEvent:test-device-id-2_mo",
                    sortKey: "2020-12-17T15:25:58Z",
                    ttl: 1608184800,
                    type: "mo",
                    value: 1,
                  },
                },
              },
              {
                PutRequest: {
                  Item: {
                    createdAt: "2020-12-17T15:13:08Z",
                    deviceId: "test-device-id-2",
                    deviceName: "Room2",
                    partitionKey: "remoEvent:test-device-id-2_te",
                    sortKey: "2020-12-17T15:13:08Z",
                    ttl: 1608184800,
                    type: "te",
                    value: 17.4,
                  },
                },
              },
            ],
          },
        },
      ],
    ]);
  });
});

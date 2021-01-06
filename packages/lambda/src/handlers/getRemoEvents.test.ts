jest.mock("../lib/awsSdk");

import getRemoEvents from "./getRemoEvents";
import { DocumentClient } from "../lib/awsSdk";

const date = new Date("2020-12-23 00:00:00Z");

beforeEach(() => {
  // console.info = jest.fn();
});
afterEach(() => {
  // @ts-expect-error
  DocumentClient.query.mockClear();
});

// TODO: Happy path only...

test("Success pattern", async () => {
  process.env = { ...process.env, MAIN_TABLE_NAME: "test-MAIN_TABLE_NAME" };

  const mockQuery = DocumentClient.query as jest.Mock<any, any>;
  mockQuery.mockReturnValueOnce({
    Items: [
      {
        value: 61,
        partitionKey: "deviceId:a09a420d-56b9-4931-9421-7420f118d546",
        deviceId: "a09a420d-56b9-4931-9421-7420f118d546",
        deviceName: "リビング",
        sortKey: "eventType:hu|createdAt:2021-01-05T12:52:05Z",
        createdAt: "2021-01-05T12:52:05Z",
        ttl: 1609881231,
        eventType: "hu",
      },
      {
        value: 4,
        partitionKey: "deviceId:a09a420d-56b9-4931-9421-7420f118d546",
        deviceId: "a09a420d-56b9-4931-9421-7420f118d546",
        deviceName: "リビング",
        sortKey: "eventType:il|createdAt:2021-01-05T10:36:18Z",
        createdAt: "2021-01-05T10:36:18Z",
        ttl: 1609881231,
        eventType: "il",
      },
    ],
  });
  mockQuery.mockReturnValueOnce({
    Items: [
      {
        value: 15,
        partitionKey: "deviceId:ca2ab384-3874-4571-aa19-59983c827108",
        deviceId: "ca2ab384-3874-4571-aa19-59983c827108",
        deviceName: "仕事部屋",
        sortKey: "eventType:te|createdAt:2021-01-05T13:57:36Z",
        createdAt: "2021-01-05T13:57:36Z",
        ttl: 1609878231,
        eventType: "te",
      },
      {
        value: 14.5,
        partitionKey: "deviceId:ca2ab384-3874-4571-aa19-59983c827108",
        deviceId: "ca2ab384-3874-4571-aa19-59983c827108",
        deviceName: "仕事部屋",
        sortKey: "eventType:te|createdAt:2021-01-05T14:32:13Z",
        createdAt: "2021-01-05T14:32:13Z",
        ttl: 1609881231,
        eventType: "te",
      },
    ],
  });

  const result = await getRemoEvents({});

  expect(mockQuery).toHaveBeenCalledTimes(2);
  expect(mockQuery).toHaveBeenNthCalledWith(1, {
    TableName: "test-MAIN_TABLE_NAME",
    KeyConditionExpression: "#pKey = :pKey and begins_with(#sKey, :sKey)",
    ExpressionAttributeNames: {
      "#pKey": "partitionKey",
      "#sKey": "sortKey",
    },
    ExpressionAttributeValues: {
      ":pKey": "deviceId:a09a420d-56b9-4931-9421-7420f118d546",
      ":sKey": "eventType:",
    },
  });
  expect(mockQuery).toHaveBeenNthCalledWith(2, {
    TableName: "test-MAIN_TABLE_NAME",
    KeyConditionExpression: "#pKey = :pKey and begins_with(#sKey, :sKey)",
    ExpressionAttributeNames: {
      "#pKey": "partitionKey",
      "#sKey": "sortKey",
    },
    ExpressionAttributeValues: {
      ":pKey": "deviceId:ca2ab384-3874-4571-aa19-59983c827108",
      ":sKey": "eventType:",
    },
  });

  expect(result).toStrictEqual({
    statusCode: 200,
    body: expect.any(String),
  });
  expect(JSON.parse(result.body ?? "")).toStrictEqual({
    remoEvents: [
      {
        value: 61,
        partitionKey: "deviceId:a09a420d-56b9-4931-9421-7420f118d546",
        deviceId: "a09a420d-56b9-4931-9421-7420f118d546",
        deviceName: "リビング",
        sortKey: "eventType:hu|createdAt:2021-01-05T12:52:05Z",
        createdAt: "2021-01-05T12:52:05Z",
        ttl: 1609881231,
        eventType: "hu",
      },
      {
        value: 4,
        partitionKey: "deviceId:a09a420d-56b9-4931-9421-7420f118d546",
        deviceId: "a09a420d-56b9-4931-9421-7420f118d546",
        deviceName: "リビング",
        sortKey: "eventType:il|createdAt:2021-01-05T10:36:18Z",
        createdAt: "2021-01-05T10:36:18Z",
        ttl: 1609881231,
        eventType: "il",
      },
      {
        value: 15,
        partitionKey: "deviceId:ca2ab384-3874-4571-aa19-59983c827108",
        deviceId: "ca2ab384-3874-4571-aa19-59983c827108",
        deviceName: "仕事部屋",
        sortKey: "eventType:te|createdAt:2021-01-05T13:57:36Z",
        createdAt: "2021-01-05T13:57:36Z",
        ttl: 1609878231,
        eventType: "te",
      },
      {
        value: 14.5,
        partitionKey: "deviceId:ca2ab384-3874-4571-aa19-59983c827108",
        deviceId: "ca2ab384-3874-4571-aa19-59983c827108",
        deviceName: "仕事部屋",
        sortKey: "eventType:te|createdAt:2021-01-05T14:32:13Z",
        createdAt: "2021-01-05T14:32:13Z",
        ttl: 1609881231,
        eventType: "te",
      },
    ],
  });
});

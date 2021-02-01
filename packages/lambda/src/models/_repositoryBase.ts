import * as AWS from "aws-sdk";
import { docClient } from "../lib/awsSdk";

type BatchWriteItemInput = AWS.DynamoDB.DocumentClient.BatchWriteItemInput;
type GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;
type PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;
type QueryInput = AWS.DynamoDB.DocumentClient.QueryInput;

export const AuthTableClient = {
  get: async (params: Omit<GetItemInput, "TableName">) => {
    return DocumentClient.get({ ...params, TableName: getAuthTableName() });
  },
  put: async (params: Omit<PutItemInput, "TableName">) => {
    return DocumentClient.put({ ...params, TableName: getAuthTableName() });
  },
  query: async (params: Omit<QueryInput, "TableName">) => {
    return DocumentClient.query({ ...params, TableName: getAuthTableName() });
  },
};

const MainTableClient = {
  get: async (params: Omit<GetItemInput, "TableName">) => {
    return DocumentClient.get({ ...params, TableName: getMainTableName() });
  },
  put: async (params: Omit<PutItemInput, "TableName">) => {
    return DocumentClient.put({ ...params, TableName: getMainTableName() });
  },
  query: async (params: Omit<QueryInput, "TableName">) => {
    return DocumentClient.query({ ...params, TableName: getMainTableName() });
  },
};

const DocumentClient = {
  batchWrite: async (params: BatchWriteItemInput) => {
    console.info("It will be batchWrite. params: ", params);
    const result = await docClient.batchWrite(params).promise();
    const { $response, ...rest } = result;
    console.info("batchWrite_result: ", rest);
    return result;
  },
  get: async (params: GetItemInput) => {
    console.info("It will be get. params: ", params);
    const result = await docClient.get(params).promise();
    const { $response, ...rest } = result;
    console.info("get_result: ", rest);
    return result;
  },
  put: async (params: PutItemInput) => {
    console.info("It will be put. params: ", params);
    const result = await docClient.put(params).promise();
    const { $response, ...rest } = result;
    console.info("put_result: ", rest);
    return result;
  },
  query: async (params: QueryInput) => {
    console.info("It will be query. params: ", params);
    const result = await docClient.query(params).promise();
    const { $response, ...rest } = result;
    console.info("query_result: ", rest);
    return result;
  },
};

function getAuthTableName() {
  const { AUTH_TABLE_NAME } = process.env;
  if (!AUTH_TABLE_NAME) {
    throw new Error("Enviroment variable `AUTH_TABLE_NAME` is required.");
  }
  return AUTH_TABLE_NAME;
}
function getMainTableName() {
  const { MAIN_TABLE_NAME } = process.env;
  if (!MAIN_TABLE_NAME) {
    throw new Error("Enviroment variable `MAIN_TABLE_NAME` is required.");
  }
  return MAIN_TABLE_NAME;
}

import * as AWS from "aws-sdk";
import { DocumentClient } from "../lib/awsSdk";

type WriteRequest = AWS.DynamoDB.DocumentClient.WriteRequest;
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

export const MainTableClient = {
  batchWrite: async (writeRequests: WriteRequest[]) => {
    return DocumentClient.batchWrite({
      RequestItems: { [getMainTableName()]: writeRequests },
    });
  },
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

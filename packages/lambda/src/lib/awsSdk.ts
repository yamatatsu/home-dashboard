import * as AWS from "aws-sdk";

type BatchWriteItemInput = AWS.DynamoDB.DocumentClient.BatchWriteItemInput;
type GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;
type PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;
type QueryInput = AWS.DynamoDB.DocumentClient.QueryInput;

const docClient = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const s3 = new AWS.S3();

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

export const DocumentClient = {
  batchWrite: async (params: BatchWriteItemInput) => {
    console.info("It will be batchWrite. params: %o", params);
    const result = await docClient.batchWrite(params).promise();
    const { $response, ...rest } = result;
    console.info("batchWrite_result: %o", rest);
    return rest;
  },
  get: async (params: GetItemInput) => {
    console.info("It will be get. params: %o", params);
    const result = await docClient.get(params).promise();
    const { $response, ...rest } = result;
    console.info("get_result: %o", rest);
    return rest;
  },
  put: async (params: PutItemInput) => {
    console.info("It will be put. params: %o", params);
    const result = await docClient.put(params).promise();
    const { $response, ...rest } = result;
    console.info("put_result: %o", rest);
    return rest;
  },
  query: async (params: QueryInput) => {
    console.info("It will be query. params: %o", params);
    const result = await docClient.query(params).promise();
    const { $response, ...rest } = result;
    console.info("query_result: %o", rest);
    return rest;
  },
};

export const SNS = {
  publish: (params: AWS.SNS.PublishInput) => {
    return sns.publish(params).promise();
  },
};

export const S3 = {
  putObject: (params: AWS.S3.PutObjectRequest) => {
    return s3.putObject(params).promise();
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

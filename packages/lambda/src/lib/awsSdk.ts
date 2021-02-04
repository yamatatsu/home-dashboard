import * as AWS from "aws-sdk";

type BatchWriteItemInput = AWS.DynamoDB.DocumentClient.BatchWriteItemInput;
type GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;
type PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;
type QueryInput = AWS.DynamoDB.DocumentClient.QueryInput;

const docClient = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const s3 = new AWS.S3();

export const DocumentClient = {
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

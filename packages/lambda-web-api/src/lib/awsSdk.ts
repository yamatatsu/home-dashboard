import * as AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const s3 = new AWS.S3();

export const DocumentClient = {
  batchWrite: async (
    params: AWS.DynamoDB.DocumentClient.BatchWriteItemInput
  ) => {
    console.info("It will be batchWrite. params: %o", params);
    const result = await docClient.batchWrite(params).promise();
    console.info("batchWrite_result: %o", result);
    return result;
  },
  get: async (params: AWS.DynamoDB.DocumentClient.GetItemInput) => {
    console.info("It will be get. params: %o", params);
    const result = await docClient.get(params).promise();
    console.info("get_result: %o", result);
    return result;
  },
  put: async (params: AWS.DynamoDB.DocumentClient.PutItemInput) => {
    console.info("It will be put. params: %o", params);
    const result = await docClient.put(params).promise();
    console.info("put_result: %o", result);
    return result;
  },
  query: async (params: AWS.DynamoDB.DocumentClient.QueryInput) => {
    console.info("It will be query. params: %o", params);
    const result = await docClient.query(params).promise();
    console.info("query_result: %o", result);
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

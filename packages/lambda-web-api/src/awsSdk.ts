import * as AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const s3 = new AWS.S3();

export const DocumentClient = {
  batchWrite: (params: AWS.DynamoDB.DocumentClient.BatchWriteItemInput) => {
    return docClient.batchWrite(params).promise();
  },
  get: (params: AWS.DynamoDB.DocumentClient.GetItemInput) => {
    return docClient.get(params).promise();
  },
  put: (params: AWS.DynamoDB.DocumentClient.PutItemInput) => {
    return docClient.put(params).promise();
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

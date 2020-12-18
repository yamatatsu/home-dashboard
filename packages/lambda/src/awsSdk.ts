import * as AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

export const DocumentClient = {
  batchWrite: async (
    params: AWS.DynamoDB.DocumentClient.BatchWriteItemInput
  ) => {
    return docClient.batchWrite(params).promise();
  },
};

export const SNS = {
  publish: async (params: AWS.SNS.PublishInput) => {
    return sns.publish(params).promise();
  },
};

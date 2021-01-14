import "source-map-support/register";
import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { DynamodbStack } from "./Dynamodb";
import { FetchRemoApi } from "./FetchRemoApi";
import { WebApi } from "./WebApi";

dotenv.config();

const { REMO_TOKEN } = process.env;
if (!REMO_TOKEN)
  throw new Error("Enviroment variable `REMO_TOKEN` is required.");

const getCode = () => lambda.Code.fromAsset(`${__dirname}/../../lambda/dist`);

const app = new cdk.App();

// =========================
// for development

const dynamodbDev = new DynamodbStack(app, "DynamodbStack-dev", { dev: true });
new WebApi(app, "WebApi-dev", {
  code: getCode(),
  homeAuthTable: dynamodbDev.homeAuthTable,
  homeMainTable: dynamodbDev.homeMainTable,
  allowOrigins: ["http://localhost:1234"],
  rpId: "localhost",
  dev: true,
});

// =========================
// for production

const dynamodb = new DynamodbStack(app, "DynamodbStack", { dev: false });
const fetchRemoApi = new FetchRemoApi(app, "FetchRemoApi", {
  code: getCode(),
  remoToken: REMO_TOKEN,
  homeMainTable: dynamodb.homeMainTable,
});
// new WebApi(app, "WebApi", {
//   code: getCode(),
//   homeAuthTable: dynamodbDev.homeAuthTable,
//   homeMainTable: dynamodbDev.homeMainTable,
//   allowOrigins: ["http://localhost:1234"],
//   rpId: "localhost",
//   dev: false,
// });

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

const app = new cdk.App();

const dynamodb = new DynamodbStack(app, "DynamodbStack");

const fetchRemoApi = new FetchRemoApi(app, "FetchRemoApi", {
  code: lambda.Code.fromAsset(`${__dirname}/../../lambda/dist`),
  remoToken: REMO_TOKEN,
  homeDataTable: dynamodb.homeDataTable,
});

new WebApi(app, "WebApi-development", {
  code: lambda.Code.fromAsset(`${__dirname}/../../lambda/dist`),
  homeAuthTable: dynamodb.homeAuthTable,
  homeDataTable: dynamodb.homeDataTable,
  allowOrigins: ["http://localhost:1234"],
  rpId: "localhost",
  dev: true,
});

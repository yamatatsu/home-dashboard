import "source-map-support/register";
import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { DynamodbStack } from "./Dynamodb";
import { FetchRemoApi } from "./FetchRemoApi";

dotenv.config();

const { REMO_TOKEN } = process.env;
if (!REMO_TOKEN)
  throw new Error("Enviroment variable `REMO_TOKEN` is required.");

const app = new cdk.App();

const dynamodb = new DynamodbStack(app, "DynamodbStack");

new FetchRemoApi(app, "FetchRemoApi", {
  code: lambda.Code.fromAsset(`${__dirname}/../../lambda/dist`),
  remoToken: REMO_TOKEN,
  remoRawEventsTable: dynamodb.remoRawEventsTable,
});

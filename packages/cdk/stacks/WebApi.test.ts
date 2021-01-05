import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { WebApi } from "./WebApi";

test("WebApi Stack", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "test-stack");

  const authTable = new dynamodb.Table(stack, "test-authTable", {
    partitionKey: { name: "hoge", type: dynamodb.AttributeType.STRING },
  });
  const mainTable = new dynamodb.Table(stack, "test-mainTable", {
    partitionKey: { name: "hoge", type: dynamodb.AttributeType.STRING },
  });

  const target = new WebApi(app, "Target", {
    code: lambda.Code.fromInline("xxx"),
    homeAuthTable: authTable,
    homeMainTable: mainTable,
    allowOrigins: ["test-allowOrigins"],
    rpId: "test-rpId",
    dev: false,
  });

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot();
});

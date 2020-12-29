import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { WebApi } from "./WebApi";

test("WebApi Stack", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "test-stack");

  const table = new dynamodb.Table(stack, "test-table", {
    partitionKey: { name: "hoge", type: dynamodb.AttributeType.STRING },
  });

  const target = new WebApi(app, "Target", {
    code: lambda.Code.fromInline("xxx"),
    homeAuthTable: table,
    allowOrigins: ["test-allowOrigins"],
    rpId: "test-rpId",
    dev: false,
  });

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot();
});

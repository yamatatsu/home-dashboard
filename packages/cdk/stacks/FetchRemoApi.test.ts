import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { FetchRemoApi } from "./FetchRemoApi";

test("FetchRemoApi Stack", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "test-stack");

  const table = new dynamodb.Table(stack, "test-table", {
    partitionKey: { name: "hoge", type: dynamodb.AttributeType.STRING },
  });

  const target = new FetchRemoApi(app, "MyTestStack", {
    code: lambda.Code.fromInline("xxx"),
    remoToken: "xxx",
    remoRawEventsTable: table,
  });

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot();
});

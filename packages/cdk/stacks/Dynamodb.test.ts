import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { DynamodbStack } from "./Dynamodb";

test("DynamodbStack Stack", () => {
  const app = new cdk.App();

  const stack = new DynamodbStack(app, "MyTestStack", { dev: false });

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

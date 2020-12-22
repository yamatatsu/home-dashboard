import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { WebApi } from "./WebApi";

test("WebApi Stack", () => {
  const app = new cdk.App();

  const target = new WebApi(app, "Target", {
    code: lambda.Code.fromInline("xxx"),
    allowOrigins: ["test-allowOrigins"],
    dev: false,
  });

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot();
});

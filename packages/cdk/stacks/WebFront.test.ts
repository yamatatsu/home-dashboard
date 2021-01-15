import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
import { WebFront } from "./WebFront";

test("WebFront Stack", () => {
  const app = new cdk.App();

  const source = s3Deployment.Source.asset(`${__dirname}/dummyAssets`);

  const target = new WebFront(app, "Target", {
    source,
  });

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot();
});

import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import { addSslOnlyPolicyToBucket } from "./util";

type Props = cdk.StackProps & {
  source: s3Deployment.ISource;
};

export class WebFront extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    addSslOnlyPolicyToBucket(bucket);

    new s3Deployment.BucketDeployment(this, "BucketDeployment", {
      sources: [props.source],
      destinationBucket: bucket,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    bucket.grantRead(originAccessIdentity);

    new cloudfront.CloudFrontWebDistribution(this, "Distribution", {
      // aliasConfiguration?: AliasConfiguration,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      httpVersion: cloudfront.HttpVersion.HTTP2,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity,
          },
          // failoverS3OriginSource?: S3OriginConfig;
          // failoverCustomOriginSource?: CustomOriginConfig;
          // failoverCriteriaStatusCodes?: FailoverStatusCode[];
          behaviors: [
            {
              pathPattern: "index.html",
              minTtl: cdk.Duration.seconds(0),
              maxTtl: cdk.Duration.seconds(0),
              defaultTtl: cdk.Duration.seconds(0),
            },
            {
              isDefaultBehavior: true,
            },
          ],
        },
      ],
      errorConfigurations: [
        {
          errorCode: 404,
          responseCode: 200,
          errorCachingMinTtl: 3,
          responsePagePath: "/",
        },
      ],
      // viewerCertificate?: ViewerCertificate,
    });
  }
}

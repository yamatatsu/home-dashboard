import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";

type WebApiProps = cdk.StackProps & {
  code: lambda.Code;
  allowOrigins: string[];
  dev: boolean;
};

export class WebApi extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: WebApiProps) {
    super(scope, id, props);

    const getAuthChallenge = new lambda.Function(this, "getAuthChallenge", {
      functionName: `HomeDashboard-WebApi${props.dev ? "-dev" : ""}`,
      code: props.code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.getAuthChallenge",
      environment: {},
      memorySize: 128,
      timeout: cdk.Duration.seconds(3),
    });

    const api = new apigateway.HttpApi(this, "HttpApi", {
      apiName: `HomeDashboardApi${props.dev ? "-dev" : ""}`,
      corsPreflight: {
        allowOrigins: props.allowOrigins,
      },
    });

    api.addRoutes({
      path: "/auth/challenge",
      methods: [apigateway.HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: getAuthChallenge }),
    });
  }
}

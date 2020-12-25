import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigateway from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";

type WebApiProps = cdk.StackProps & {
  code: lambda.Code;
  homeAuthTable: dynamodb.ITable;
  allowOrigins: string[];
  dev: boolean;
};

export class WebApi extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: WebApiProps) {
    super(scope, id, props);

    const signUpChallenge = new lambda.Function(this, "signUpChallenge", {
      functionName: `HomeDashboard-signUpChallenge${props.dev ? "-dev" : ""}`,
      code: props.code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.signUpChallenge",
      environment: {
        AUTH_TABLE_NAME: props.homeAuthTable.tableName,
      },
    });
    props.homeAuthTable.grantReadWriteData(signUpChallenge);

    const api = new apigateway.HttpApi(this, "HttpApi", {
      apiName: `HomeDashboard-WebApi${props.dev ? "-dev" : ""}`,
      corsPreflight: {
        allowOrigins: props.allowOrigins,
        allowMethods: [apigateway.HttpMethod.POST],
        allowHeaders: ["content-type"],
        allowCredentials: true,
      },
    });

    api.addRoutes({
      path: "/auth/signUpChallenge",
      methods: [apigateway.HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: signUpChallenge }),
    });
    api.addRoutes({
      path: "/auth/signUp",
      methods: [apigateway.HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: signUpChallenge }),
    });
    api.addRoutes({
      path: "/auth/signInChallenge",
      methods: [apigateway.HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: signUpChallenge }),
    });
    api.addRoutes({
      path: "/auth/signIn",
      methods: [apigateway.HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: signUpChallenge }),
    });
  }
}

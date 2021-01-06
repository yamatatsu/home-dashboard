import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigateway from "@aws-cdk/aws-apigatewayv2";
import * as logs from "@aws-cdk/aws-logs";
import * as iam from "@aws-cdk/aws-iam";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";

type WebApiProps = cdk.StackProps & {
  code: lambda.Code;
  homeAuthTable: dynamodb.ITable;
  homeMainTable: dynamodb.ITable;
  allowOrigins: string[];
  rpId: string;
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
      memorySize: 256,
      timeout: cdk.Duration.seconds(4),
    });
    const signUp = new lambda.Function(this, "signUp", {
      functionName: `HomeDashboard-signUp${props.dev ? "-dev" : ""}`,
      code: props.code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.signUp",
      environment: {
        AUTH_TABLE_NAME: props.homeAuthTable.tableName,
        ALLOW_ORIGINS: props.allowOrigins.join(","),
        RP_ID: props.rpId,
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(4),
    });
    const signInChallenge = new lambda.Function(this, "signInChallenge", {
      functionName: `HomeDashboard-signInChallenge${props.dev ? "-dev" : ""}`,
      code: props.code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.signInChallenge",
      environment: {
        AUTH_TABLE_NAME: props.homeAuthTable.tableName,
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(4),
    });
    const signIn = new lambda.Function(this, "signIn", {
      functionName: `HomeDashboard-signIn${props.dev ? "-dev" : ""}`,
      code: props.code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.signIn",
      environment: {
        AUTH_TABLE_NAME: props.homeAuthTable.tableName,
        ALLOW_ORIGINS: props.allowOrigins.join(","),
        RP_ID: props.rpId,
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(4),
    });

    const authorize = new lambda.Function(this, "authorize", {
      functionName: `HomeDashboard-authorize${props.dev ? "-dev" : ""}`,
      code: props.code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.authorize",
      environment: {
        AUTH_TABLE_NAME: props.homeAuthTable.tableName,
      },
      memorySize: 128,
      timeout: cdk.Duration.seconds(4),
    });

    const getRemoEvents = new lambda.Function(this, "getRemoEvents", {
      functionName: `HomeDashboard-getRemoEvents${props.dev ? "-dev" : ""}`,
      code: props.code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.getRemoEvents",
      environment: {
        MAIN_TABLE_NAME: props.homeMainTable.tableName,
      },
      memorySize: 128,
      timeout: cdk.Duration.seconds(4),
    });

    props.homeAuthTable.grantReadWriteData(signUpChallenge);
    props.homeAuthTable.grantReadWriteData(signUp);
    props.homeAuthTable.grantReadWriteData(signInChallenge);
    props.homeAuthTable.grantReadWriteData(signIn);
    props.homeAuthTable.grantReadData(authorize);

    props.homeMainTable.grantReadData(getRemoEvents);

    const api = new apigateway.HttpApi(this, "HttpApi", {
      apiName: `HomeDashboard-WebApi${props.dev ? "-dev" : ""}`,
      corsPreflight: {
        allowOrigins: props.allowOrigins,
        allowMethods: [apigateway.HttpMethod.GET, apigateway.HttpMethod.POST],
        allowHeaders: ["content-type", "x-hd-auth"],
        allowCredentials: true,
      },
    });
    const logGroup = new logs.LogGroup(this, "apiLogGroup", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    if (api.defaultStage) {
      const cfnStage = api.defaultStage.node
        .defaultChild as apigateway.CfnStage;
      cfnStage.accessLogSettings = {
        destinationArn: logGroup.logGroupArn,
        format: JSON.stringify({
          requestId: "$context.requestId",
          ip: "$context.identity.sourceIp",
          requestTime: "$context.requestTimeEpoch",
          httpMethod: "$context.httpMethod",
          path: "$context.path",
          routeKey: "$context.routeKey",
          status: "$context.status",
          protocol: "$context.protocol",
          responseLength: "$context.responseLength",
          responseLatency: "$context.responseLatency",
          "authorizer.error": "$context.authorizer.error",
          "authorizer.principalId": "$context.authorizer.principalId",
          "error.message": "$context.error.message",
          "error.messageString": "$context.error.messageString",
          "error.responseType": "$context.error.responseType",
          "integration.error": "$context.integration.error",
          "integration.integrationStatus":
            "$context.integration.integrationStatus",
          "integration.latency": "$context.integration.latency",
          "integration.requestId": "$context.integration.requestId",
          "integration.status": "$context.integration.status",
        }),
      };
    }

    const authorizer = new apigateway.CfnAuthorizer(this, "Authorizer", {
      apiId: api.httpApiId,
      authorizerType: "REQUEST",
      identitySource: ["$request.header.x-hd-auth"],
      name: "HomeDashboardAuthorizer",
      authorizerPayloadFormatVersion: "2.0",
      authorizerResultTtlInSeconds: 4,
      authorizerUri: cdk.Fn.sub(
        "arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${fnArn}/invocations",
        { region: this.region, fnArn: authorize.functionArn }
      ),
      enableSimpleResponses: true,
    });

    api.addRoutes({
      path: "/auth/signUpChallenge",
      methods: [apigateway.HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: signUpChallenge }),
    });
    api.addRoutes({
      path: "/auth/signUp",
      methods: [apigateway.HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: signUp }),
    });
    api.addRoutes({
      path: "/auth/signInChallenge",
      methods: [apigateway.HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: signInChallenge }),
    });
    api.addRoutes({
      path: "/auth/signIn",
      methods: [apigateway.HttpMethod.POST],
      integration: new LambdaProxyIntegration({ handler: signIn }),
    });

    const routes = api.addRoutes({
      path: "/remoEvents",
      methods: [apigateway.HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: getRemoEvents }),
    });

    routes.forEach((route) => {
      const cfnRoute = route.node.defaultChild as apigateway.CfnRoute;
      cfnRoute.authorizationType = "CUSTOM";
      cfnRoute.authorizerId = authorizer.ref;

      authorize.addPermission(`authorize-${route.path}-Permission`, {
        principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
        sourceArn: cdk.Stack.of(route).formatArn({
          service: "execute-api",
          resource: route.httpApi.httpApiId,
          resourceName: `authorizers/${authorizer.ref}`,
        }),
      });
    });
  }
}

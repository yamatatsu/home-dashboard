import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as eventsTargets from "@aws-cdk/aws-events-targets";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

type FetchRemoApiProps = cdk.StackProps & {
  code: lambda.Code;
  remoToken: string;
  remoRawEventsTable: dynamodb.ITable;
};

export class FetchRemoApi extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: FetchRemoApiProps) {
    super(scope, id, props);

    const { code, remoToken, remoRawEventsTable } = props;

    const fn = new lambda.Function(this, "Function", {
      functionName: "FetchRemoApi",
      code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      environment: {
        REMO_TOKEN: remoToken,
        TABLE_NAME: remoRawEventsTable.tableName,
      },
      memorySize: 128,
      timeout: cdk.Duration.seconds(3),
    });

    new events.Rule(this, "Rule", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(10)),
      targets: [new eventsTargets.LambdaFunction(fn)],
    });

    remoRawEventsTable.grantWriteData(fn);
  }
}

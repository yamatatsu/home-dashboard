import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as eventsTargets from "@aws-cdk/aws-events-targets";
import * as sns from "@aws-cdk/aws-sns";
import * as sqs from "@aws-cdk/aws-sqs";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { SqsSubscription } from "@aws-cdk/aws-sns-subscriptions";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";
import * as s3 from "@aws-cdk/aws-s3";

type FetchRemoApiProps = cdk.StackProps & {
  code: lambda.Code;
  remoToken: string;
  homeDataTable: dynamodb.ITable;
};

/**
 * Schedule -> Lambda -> SNS -> SQS -> Lambda -> DynamoDB
 * use SNS for extensibility and my learning 😜
 * use SQS for rerunability and my learning 😜
 */
export class FetchRemoApi extends cdk.Stack {
  public readonly topic: sns.ITopic;

  constructor(scope: cdk.Construct, id: string, props: FetchRemoApiProps) {
    super(scope, id, props);

    const { code, remoToken, homeDataTable } = props;

    const topic = new sns.Topic(this, "Topic");
    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const fetchRemoApi = new lambda.Function(this, "fetchRemoApi", {
      functionName: "HomeDashboard-FetchRemoApi",
      code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.fetchRemoApi",
      environment: {
        REMO_TOKEN: remoToken,
        TOPIC_ARN: topic.topicArn,
      },
      memorySize: 128,
      timeout: cdk.Duration.seconds(3),
    });
    const putRemoData = new lambda.Function(this, "putRemoData", {
      functionName: "HomeDashboard-PutRemoData",
      code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.putRemoData",
      environment: {
        TABLE_NAME: homeDataTable.tableName,
      },
      memorySize: 128,
      timeout: cdk.Duration.seconds(3),
    });
    const backupRemoData = new lambda.Function(this, "backupRemoData", {
      functionName: "HomeDashboard-BackupRemoData",
      code,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.backupRemoData",
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      memorySize: 128,
      timeout: cdk.Duration.seconds(3),
    });

    new events.Rule(this, "ScheduleRule", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(10)),
      targets: [new eventsTargets.LambdaFunction(fetchRemoApi)],
    });

    topic.grantPublish(fetchRemoApi);

    const putRemoDataQueue = new sqs.Queue(this, "putRemoDataQueue", {});
    const backupRemoDataQueue = new sqs.Queue(this, "backupRemoDataQueue", {});
    topic.addSubscription(new SqsSubscription(putRemoDataQueue));
    topic.addSubscription(new SqsSubscription(backupRemoDataQueue));
    putRemoData.addEventSource(new SqsEventSource(putRemoDataQueue));
    backupRemoData.addEventSource(new SqsEventSource(backupRemoDataQueue));

    homeDataTable.grantWriteData(putRemoData);
    bucket.grantPut(backupRemoData);
  }
}

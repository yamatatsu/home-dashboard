import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class DynamodbStack extends cdk.Stack {
  public readonly remoRawEventsTable: dynamodb.ITable;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const remoRawEventsTable = new dynamodb.Table(this, "RemoRawEventsTable", {
      partitionKey: { name: "time", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.remoRawEventsTable = remoRawEventsTable;
  }
}

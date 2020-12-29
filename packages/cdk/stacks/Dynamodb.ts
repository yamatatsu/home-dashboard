import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class DynamodbStack extends cdk.Stack {
  public readonly homeAuthTable: dynamodb.ITable;
  public readonly homeDataTable: dynamodb.ITable;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 認証用のテーブル。未認証時もアクセスされるのでテーブルを分ける。
    // 行レベルでのアクセス制御もやってみたいが、今は考慮せずに進む。
    const homeAuthTable = new dynamodb.Table(this, "HomeAuthTable", {
      partitionKey: {
        name: "partitionKey",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "sortKey", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const homeDataTable = new dynamodb.Table(this, "HomeDataTable", {
      partitionKey: {
        name: "partitionKey",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "sortKey", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.homeAuthTable = homeAuthTable;
    this.homeDataTable = homeDataTable;
  }
}

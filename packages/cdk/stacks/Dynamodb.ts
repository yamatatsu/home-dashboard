import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

type Props = cdk.StackProps & { dev: boolean };

export class DynamodbStack extends cdk.Stack {
  public readonly homeAuthTable: dynamodb.ITable;
  public readonly homeMainTable: dynamodb.ITable;

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id, props);

    const tableNameSuffix = props.dev ? "-dev" : "";

    // 認証用のテーブル。未認証時もアクセスされるのでテーブルを分ける。
    // 行レベルでのアクセス制御もやってみたいが、今は考慮せずに進む。
    const homeAuthTable = new dynamodb.Table(this, "HomeAuthTable", {
      tableName: `HomeDashboard-Auth${tableNameSuffix}`,
      partitionKey: {
        name: "partitionKey",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "sortKey", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const homeMainTable = new dynamodb.Table(this, "HomeDataTable", {
      tableName: `HomeDashboard-Main${tableNameSuffix}`,
      partitionKey: {
        name: "partitionKey",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "sortKey", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.homeAuthTable = homeAuthTable;
    this.homeMainTable = homeMainTable;
  }
}

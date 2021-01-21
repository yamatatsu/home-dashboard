import * as AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient({ region: "ap-northeast-1" });

main();

async function main() {
  const result = await docClient
    .scan({ TableName: "HomeDashboard-Main" })
    .promise();
  if (!result.Items) {
    console.warn("No items!");
    return;
  }

  const writeRequests = result.Items.map((item) => {
    const { ttl, ...rest } = item;
    return { PutRequest: { Item: rest } };
  });
  await chunk(writeRequests, 25).reduce(async (promise, req) => {
    await promise;
    return docClient
      .batchWrite({ RequestItems: { "HomeDashboard-Main-dev": req } })
      .promise();
  }, Promise.resolve() as Promise<any>);
}
const chunk = <T>(arr: T[], size: number): T[][] => {
  const head = arr.slice(0, size);
  const tail = arr.slice(size);
  if (tail.length === 0) {
    return [head];
  }
  return [head, ...chunk(tail, size)];
};

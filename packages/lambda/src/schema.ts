export type RemoEvent = {
  partitionKey: string;
  sortKey: string;
  deviceId: string;
  deviceName: string;
  type: string;
  createdAt: string;
  value: number;
};

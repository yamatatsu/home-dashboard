import { ScheduledHandler, SQSHandler } from "aws-lambda";
import _fetchRemoApi from "./fetchRemoApi";
import _putRemoData from "./putRemoData";
import _backupRemoData from "./backupRemoData";

export const fetchRemoApi: ScheduledHandler = async () => {
  return _fetchRemoApi();
};
export const putRemoData: SQSHandler = async (event) => {
  return _putRemoData(event.Records[0].body, new Date());
};
export const backupRemoData: SQSHandler = async (event) => {
  return _backupRemoData(event.Records[0].body, new Date());
};

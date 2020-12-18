import React from "react";
import { PNG, Diagram, GeneralIcon } from "rediagram";
import {
  AWS,
  InvizAWS,
  Lambda,
  SNS,
  SQS,
  DynamoDB,
  CloudWatch,
} from "@rediagram/aws";

PNG(
  <Diagram>
    <InvizAWS>
      <GeneralIcon name="Remo API" type="Client" downstream={["Fetcher"]} />
      <AWS>
        <CloudWatch
          name="Schedule\n(1/10min)"
          type="Rule"
          upstream={["Fetcher"]}
        />
        <Lambda name="Fetcher" upstream={["Topic"]} />
        <SNS name="Topic" upstream={["Queue"]} />
        <SQS name="Queue" upstream={["Transformer"]} />
        <Lambda name="Transformer" upstream={["DynamoDB"]} />
        <DynamoDB name="DynamoDB" />
      </AWS>
    </InvizAWS>
  </Diagram>
);

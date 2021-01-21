import React from "react";
import { NextPage } from "next";
import { useRecoilState, useRecoilValueLoadable } from "recoil";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";

import { useGoToLogin } from "../lib/routes";
import { sessionIdAtom, remoEventsSelector } from "../lib/recoil";

const Page: NextPage = () => {
  const [sessionId, setSessionId] = useRecoilState(sessionIdAtom);
  const goToLogin = useGoToLogin();

  const remoEventsResult = useRecoilValueLoadable(remoEventsSelector);

  React.useEffect(() => {
    if (!sessionId) {
      goToLogin();
    }
  }, [sessionId]);

  const logout = () => setSessionId("");

  switch (remoEventsResult.state) {
    case "loading": {
      return <div>Loading...</div>;
    }
    case "hasError": {
      throw remoEventsResult.errorOrThrow();
    }
    case "hasValue": {
      const value = remoEventsResult.getValue();
      if (!value.signed) {
        return <div>Token expired...</div>;
      }

      const remoEvents: {
        value: number;
        deviceId: string;
        deviceName: string;
        createdAt: string;
        eventType: string;
      }[] = value.remoEvents;
      const groups = Object.entries(
        remoEvents.reduce((acc, remoEvent) => {
          const key = `${remoEvent.deviceId}-${remoEvent.eventType}`;
          const events = acc[key] ?? [];
          return {
            ...acc,
            [key]: [
              ...events,
              {
                value: remoEvent.value,
                createdAt: new Date(remoEvent.createdAt).getTime(),
              },
            ],
          };
        }, {} as Record<string, { value: number; createdAt: number }[]>)
      );
      const { min, max } = remoEvents.reduce(
        (acc, remoEvent) => {
          const createdAt = new Date(remoEvent.createdAt).getTime();
          if (!acc.min || !acc.max) {
            return { min: createdAt, max: createdAt };
          } else if (acc.min > createdAt) {
            return { ...acc, min: createdAt };
          } else if (acc.max < createdAt) {
            return { ...acc, max: createdAt };
          } else {
            return acc;
          }
        },
        { min: 0, max: 0 }
      );
      return (
        <>
          <div>awesome Contents</div>
          <div>
            {groups.map(([eventKey, values]) => (
              <div key={eventKey}>
                <h3>{eventKey}</h3>
                <ResponsiveContainer width="95%" height={200}>
                  <LineChart data={values} syncId="anyId">
                    <XAxis
                      dataKey="createdAt"
                      domain={[min, max]}
                      name="Time"
                      tickFormatter={(unixTime) =>
                        format(unixTime, "yyyy-MM-dd HH:mm")
                      }
                      type="number"
                    />
                    <YAxis
                      dataKey="value"
                      name="Value"
                      domain={["auto", "auto"]}
                    />
                    <CartesianGrid />
                    <Tooltip
                      labelFormatter={(unixTime) =>
                        format(unixTime, "yyyy-MM-dd HH:mm")
                      }
                    />
                    <Line dataKey="value" name="Values" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setSessionId("");
            }}
          >
            signout
          </button>
        </>
      );
    }
  }
};
export default Page;

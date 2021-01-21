import { atom, selector } from "recoil";
import { fetchGetRemoEvents } from "./fetching";

export const sessionIdAtom = atom({ key: "sessionId", default: "" });

type RemoEvents = { signed: false } | { signed: true; remoEvents: any };
export const remoEventsSelector = selector<RemoEvents>({
  key: "charCountState", // unique ID (with respect to other atoms/selectors)
  get: async ({ get }) => {
    const sessionId = get(sessionIdAtom);
    if (!sessionId) {
      return { signed: false };
    }
    const result = await fetchGetRemoEvents(sessionId);
    return { signed: true, remoEvents: result.remoEvents };
  },
});

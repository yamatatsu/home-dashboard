import { atom, selector } from "recoil";
import { fetchGetRemoEvents } from "./lib/fetching";

export const sessionIdAtom = atom({ key: "sessionId", default: "" });

export const remoEventsSelector = selector({
  key: "charCountState", // unique ID (with respect to other atoms/selectors)
  get: async ({ get }) => {
    const sessionId = get(sessionIdAtom);
    if (!sessionId) {
      return { signed: false };
    }
    const remoEvents = await fetchGetRemoEvents(sessionId);
    return { signed: true, remoEvents };
  },
});

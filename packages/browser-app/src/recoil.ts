import { atom, selector } from "recoil";
import { fetchGetRemoEvents } from "./lib/fetching";

export const signedInAtom = atom({ key: "signedInAtom", default: false });

export const remoEventsSelector = selector({
  key: "charCountState", // unique ID (with respect to other atoms/selectors)
  get: async ({ get }) => {
    const signed = get(signedInAtom);
    if (!signed) {
      return { signed };
    }
    const remoEvents = await fetchGetRemoEvents();
    return { signed, remoEvents };
  },
});

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;
export const DEV = process.env.NODE_ENV === "development";

export const SIGN_UP_CHALLENGE_URL = API_ORIGIN + "/auth/signUpChallenge";
export const SIGN_UP_URL = API_ORIGIN + "/auth/signUp";
export const SIGN_IN_CHALLENGE_URL = API_ORIGIN + "/auth/signInChallenge";
export const SIGN_IN_URL = API_ORIGIN + "/auth/signIn";

export const REMO_EVENTS_URL = API_ORIGIN + "/remoEvents";

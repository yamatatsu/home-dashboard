export const getTtl = (date: Date, hour: number) =>
  Math.floor(date.getTime() / 1000) + hour * 60 * 60;

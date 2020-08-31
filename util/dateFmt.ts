interface DateFmtValues {
  original: string | undefined;
  tenBehind: string;
  yesterday: string;
}

/**
 * Get formatted current date, yesterday, and date from 10 minutes ago
 * @function
 *
 * @param {string} date original date
 * @return {object} {original data, ten minutes ago, yesteday}
 */
const dateFmt = (date?: string): DateFmtValues => {
  let original: string | undefined;
  const now: Date = new Date();
  const oneDayAgo: number = now.setDate(now.getDate() - 1);
  const tenMinutesAgo: number = now.setMinutes(now.getMinutes() - 10);
  const offset: number = now.getTimezoneOffset() * 60000;
  const yesterday: string = new Date(oneDayAgo - offset)
    .toISOString()
    .slice(0, -5);
  const tenBehind: string = new Date(tenMinutesAgo - offset)
    .toISOString()
    .slice(0, -5);

  if (date) {
    const originalDate: Date = new Date(date);
    const originalOffsetted: any = +new Date(date) - offset;
    original = new Date(originalOffsetted).toISOString().slice(0, -5);
  }

  return {
    original,
    tenBehind,
    yesterday,
  };
};

/**
 * Get timestamp from 10 minutes ago.
 *
 * @return {string} datetime - 10m
 */
export const tenBehind = (): string => {
  const now: Date = new Date();
  const tenMinutesAgo: number = now.setMinutes(now.getMinutes() - 10);
  const offset: number = now.getTimezoneOffset() * 60000;
  const dateTime: string = new Date(tenMinutesAgo - offset)
    .toISOString()
    .slice(0, -5);

  return dateTime;
};

export default dateFmt;

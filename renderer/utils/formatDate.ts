import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function formatDate(date: Date | number) {
  if (!date) {
    return "";
  }

  const asDate = typeof date === "number" ? new Date(date) : date;

  return formatInTimeZone(
    parseISO(asDate.toISOString()),
    "UTC",
    `yyyy-MM-dd HH:mm:ss zzz`,
  );
}

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

export function currentWeekStart() {
  return dayjs().startOf("week").add(1, "day").startOf("day").toDate(); // Monday
}

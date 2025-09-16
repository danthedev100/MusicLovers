import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Refresh recently viewed artists every 10-15 minutes
 */
crons.interval(
  "refresh recently viewed artists",
  { minutes: 12 }, // Every 12 minutes
  internal.cronJobs.refreshRecentlyViewed
);

export default crons;

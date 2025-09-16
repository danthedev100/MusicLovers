import { internalMutation } from "./_generated/server";
import { isItemStale } from "../lib/hash";

/**
 * Cron job to refresh recently viewed artists
 */
export const refreshRecentlyViewed = internalMutation({
  handler: async (ctx) => {
    try {
      // Get all artists (in production, track "recently viewed" separately)
      const artists = await ctx.db.query("artists").collect();
      
      let refreshed = 0;
      
      for (const artist of artists) {
        try {
          // Check if artist has stale items
          const items = await ctx.db
            .query("items")
            .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
            .collect();
          
          const hasStaleItems = items.some(item => 
            isItemStale({ kind: item.kind, createdAt: item.createdAt })
          );
          
          if (hasStaleItems) {
            // Import and call refresh function
            const { refreshArtist } = await import("./items");
            
            await refreshArtist(ctx, {
              artistId: artist._id,
            });
            
            refreshed++;
          }
          
        } catch (error) {
          console.error(`Cron refresh error for artist ${artist.name}:`, error);
        }
      }
      
      console.log(`Cron: Refreshed ${refreshed} artists`);
      return { refreshed };
      
    } catch (error) {
      console.error("Cron job error:", error);
      throw error;
    }
  },
});

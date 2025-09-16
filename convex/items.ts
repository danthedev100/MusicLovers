import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { fetchRecent as fetchYouTube } from "./adapters/youtube";
import { fetchRecent as fetchSoundCloud } from "./adapters/soundcloud";
import { fetchArtistAndReleases as fetchSpotify } from "./adapters/spotify";
import { fetchRecentRss as fetchNews } from "./adapters/news";
import { generateItemHash, isItemStale } from "../lib/hash";
import { calculateRegionScore, sortItemsByZAFirstThenRecency, filterByRecencyWindow } from "../lib/ranking";
import type { Region } from "../lib/ranking";

/**
 * List items for an artist with filters and ranking
 */
export const listByArtist = query({
  args: {
    artistId: v.id("artists"),
    region: v.optional(v.string()),
    window: v.optional(v.string()),
    kind: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const region = (args.region as Region) || 'GLOBAL';
    const window = (args.window as '24h' | '7d' | '30d') || '7d';
    const kind = args.kind as 'news' | 'youtube' | 'soundcloud' | 'spotify' | undefined;
    
    // Build query
    let query = ctx.db.query("items").withIndex("by_artist", (q) => 
      q.eq("artistId", args.artistId)
    );
    
    // Filter by kind if specified
    if (kind) {
      query = query.filter((q) => q.eq(q.field("kind"), kind));
    }
    
    let items = await query.collect();
    
    // Filter by recency window
    items = filterByRecencyWindow(items, window);
    
    // Calculate region scores
    const itemsWithScores = items.map(item => ({
      ...item,
      regionScore: calculateRegionScore(
        {
          source: { domain: item.source?.domain },
          title: item.title,
          publishedAt: item.publishedAt,
        },
        region
      ),
    }));
    
    // Sort by ZA-first ranking
    const rankedItems = sortItemsByZAFirstThenRecency(itemsWithScores);
    
    return rankedItems;
  },
});

/**
 * Refresh artist items by fetching from all sources
 */
export const refreshArtist = mutation({
  args: {
    artistId: v.id("artists"),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const region = (args.region as Region) || 'GLOBAL';
    
    try {
      // Get artist details
      const artist = await ctx.db.get(args.artistId);
      if (!artist) {
        throw new Error("Artist not found");
      }
      
      // Calculate since timestamp (use oldest TTL)
      const since = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 min ago
      
      // Fetch from all sources in parallel
      const [youtubeItems, soundcloudItems, spotifyResult, newsItems] = await Promise.allSettled([
        fetchYouTube(artist.name, region, since),
        fetchSoundCloud(artist.name, region, since),
        fetchSpotify(artist.name, region),
        fetchNews(artist.name, region, since),
      ]);
      
      const results: Record<string, { ok: boolean; count: number; error?: string }> = {};
      let totalUpdated = 0;
      
      // Process YouTube results
      if (youtubeItems.status === 'fulfilled') {
        const count = await upsertItems(ctx, args.artistId, youtubeItems.value, 'youtube');
        results.youtube = { ok: true, count };
        totalUpdated += count;
      } else {
        results.youtube = { ok: false, count: 0, error: youtubeItems.reason?.message };
      }
      
      // Process SoundCloud results
      if (soundcloudItems.status === 'fulfilled') {
        const count = await upsertItems(ctx, args.artistId, soundcloudItems.value, 'soundcloud');
        results.soundcloud = { ok: true, count };
        totalUpdated += count;
      } else {
        results.soundcloud = { ok: false, count: 0, error: soundcloudItems.reason?.message };
      }
      
      // Process Spotify results
      if (spotifyResult.status === 'fulfilled') {
        const count = await upsertItems(ctx, args.artistId, spotifyResult.value.items, 'spotify');
        results.spotify = { ok: true, count };
        totalUpdated += count;
      } else {
        results.spotify = { ok: false, count: 0, error: spotifyResult.reason?.message };
      }
      
      // Process News results
      if (newsItems.status === 'fulfilled') {
        const count = await upsertItems(ctx, args.artistId, newsItems.value, 'news');
        results.news = { ok: true, count };
        totalUpdated += count;
      } else {
        results.news = { ok: false, count: 0, error: newsItems.reason?.message };
      }
      
      return {
        updated: totalUpdated,
        sources: results,
      };
      
    } catch (error) {
      console.error("Refresh artist error:", error);
      throw error;
    }
  },
});

/**
 * Upsert items from adapter results, handling deduplication
 */
async function upsertItems(
  ctx: any,
  artistId: string,
  adapterItems: any[],
  kind: 'news' | 'youtube' | 'soundcloud' | 'spotify'
) {
  let upserted = 0;
  
  for (const adapterItem of adapterItems) {
    try {
      // Generate hash for deduplication
      const hash = generateItemHash(kind, adapterItem.externalId, adapterItem.url);
      
      // Check if item already exists
      const existing = await ctx.db
        .query("items")
        .withIndex("by_hash", (q) => q.eq("hash", hash))
        .first();
      
      if (existing) {
        // Update if needed (e.g., title changed)
        if (existing.title !== adapterItem.title) {
          await ctx.db.patch(existing._id, {
            title: adapterItem.title,
            url: adapterItem.url,
            embedHtml: adapterItem.embedHtml,
            oEmbedUrl: adapterItem.oEmbedUrl,
          });
          upserted++;
        }
        continue;
      }
      
      // Find or create source
      let sourceId = await findOrCreateSource(ctx, adapterItem.source);
      
      // Calculate region score
      const regionScore = calculateRegionScore(
        {
          source: adapterItem.source,
          title: adapterItem.title,
          publishedAt: adapterItem.publishedAt,
        },
        'ZA' // Default to ZA for scoring
      );
      
      // Insert new item
      await ctx.db.insert("items", {
        artistId,
        sourceId,
        kind,
        title: adapterItem.title,
        url: adapterItem.url,
        embedHtml: adapterItem.embedHtml,
        oEmbedUrl: adapterItem.oEmbedUrl,
        publishedAt: adapterItem.publishedAt,
        regionScore,
        pinned: false,
        hash,
        createdAt: new Date().toISOString(),
      });
      
      upserted++;
      
    } catch (error) {
      console.error("Upsert item error:", error);
    }
  }
  
  return upserted;
}

/**
 * Find or create a source record
 */
async function findOrCreateSource(ctx: any, sourceData: any) {
  // Try to find existing source
  const existing = await ctx.db
    .query("sources")
    .withIndex("by_kind", (q) => q.eq("kind", sourceData.kind))
    .filter((q) => 
      q.and(
        q.eq(q.field("domain"), sourceData.domain),
        q.eq(q.field("channelId"), sourceData.channelId)
      )
    )
    .first();
  
  if (existing) {
    return existing._id;
  }
  
  // Create new source
  return await ctx.db.insert("sources", {
    kind: sourceData.kind,
    regionHints: sourceData.regionHints || [],
    domain: sourceData.domain,
    channelId: sourceData.channelId,
    createdAt: new Date().toISOString(),
  });
}

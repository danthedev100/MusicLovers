import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { fetchArtistAndReleases } from "./adapters/spotify";
import type { Region } from "../lib/ranking";

export interface ArtistCandidate {
  id?: string;
  name: string;
  imageUrl?: string;
  spotifyId?: string;
}

/**
 * Search for artists by name, canonicalize via Spotify first
 */
export const searchByName = mutation({
  args: { name: v.string(), region: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const region = (args.region as Region) || 'GLOBAL';
    
    try {
      // Use Spotify to find canonical artist matches
      const { artist } = await fetchArtistAndReleases(args.name, region);
      
      if (artist) {
        // Check if artist already exists in our DB
        const existing = await ctx.db
          .query("artists")
          .withIndex("by_slug", (q) => q.eq("slug", artist.slug))
          .first();
        
        if (existing) {
          return {
            candidates: [{
              id: existing._id,
              name: existing.name,
              imageUrl: existing.imageUrl,
              spotifyId: existing.platformIds.spotifyId,
            }]
          };
        }
        
        // Return candidate for user selection
        return {
          candidates: [{
            name: artist.name,
            imageUrl: artist.imageUrl,
            spotifyId: artist.platformIds.spotifyId,
          }]
        };
      }
      
      // Fallback: check existing artists in our DB
      const existingArtists = await ctx.db
        .query("artists")
        .withIndex("by_name", (q) => q.eq("name", args.name))
        .collect();
      
      return {
        candidates: existingArtists.map(artist => ({
          id: artist._id,
          name: artist.name,
          imageUrl: artist.imageUrl,
          spotifyId: artist.platformIds.spotifyId,
        }))
      };
      
    } catch (error) {
      console.error("Artist search error:", error);
      return { candidates: [] };
    }
  },
});

/**
 * Get artist by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("artists")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Create or update an artist from Spotify data
 */
export const upsertFromSpotify = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    imageUrl: v.optional(v.string()),
    spotifyId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if artist exists
    const existing = await ctx.db
      .query("artists")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      // Update existing artist
      await ctx.db.patch(existing._id, {
        name: args.name,
        imageUrl: args.imageUrl,
        platformIds: {
          ...existing.platformIds,
          spotifyId: args.spotifyId,
        },
      });
      return existing._id;
    }
    
    // Create new artist
    return await ctx.db.insert("artists", {
      name: args.name,
      slug: args.slug,
      imageUrl: args.imageUrl,
      platformIds: {
        spotifyId: args.spotifyId,
      },
      createdAt: new Date().toISOString(),
    });
  },
});

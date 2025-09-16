import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Pin or unpin an item (server-key gated)
 */
export const pinItem = mutation({
  args: {
    itemId: v.id("items"),
    pinned: v.boolean(),
    adminKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin key
    const serverAdminKey = process.env.SERVER_ADMIN_KEY;
    if (!serverAdminKey || args.adminKey !== serverAdminKey) {
      throw new Error("Unauthorized: Invalid admin key");
    }
    
    // Update item
    await ctx.db.patch(args.itemId, {
      pinned: args.pinned,
    });
    
    return { ok: true };
  },
});

/**
 * Add or update a note on an item (server-key gated)
 */
export const addNote = mutation({
  args: {
    itemId: v.id("items"),
    note: v.string(),
    adminKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin key
    const serverAdminKey = process.env.SERVER_ADMIN_KEY;
    if (!serverAdminKey || args.adminKey !== serverAdminKey) {
      throw new Error("Unauthorized: Invalid admin key");
    }
    
    // Update item
    await ctx.db.patch(args.itemId, {
      note: args.note.trim() || undefined,
    });
    
    return { ok: true };
  },
});

/**
 * Manually trigger refresh for an artist (server-key gated)
 */
export const triggerRefresh = mutation({
  args: {
    artistId: v.id("artists"),
    adminKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin key
    const serverAdminKey = process.env.SERVER_ADMIN_KEY;
    if (!serverAdminKey || args.adminKey !== serverAdminKey) {
      throw new Error("Unauthorized: Invalid admin key");
    }
    
    // Import and call refresh function
    const { refreshArtist } = await import("./items");
    
    // Trigger refresh
    const result = await refreshArtist(ctx, {
      artistId: args.artistId,
    });
    
    return result;
  },
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  artists: defineTable({
    name: v.string(),
    slug: v.string(),
    imageUrl: v.optional(v.string()),
    platformIds: v.object({
      spotifyId: v.optional(v.string()),
      youtubeChannelId: v.optional(v.string()),
    }),
    createdAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  sources: defineTable({
    kind: v.union(v.literal("news"), v.literal("youtube"), v.literal("soundcloud"), v.literal("spotify")),
    regionHints: v.array(v.union(v.literal("ZA"), v.literal("UK"), v.literal("EU"), v.literal("GLOBAL"))),
    domain: v.optional(v.string()),
    channelId: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_kind", ["kind"]),

  items: defineTable({
    artistId: v.id("artists"),
    sourceId: v.id("sources"),
    kind: v.union(v.literal("news"), v.literal("youtube"), v.literal("soundcloud"), v.literal("spotify")),
    title: v.string(),
    url: v.string(),
    embedHtml: v.optional(v.string()),
    oEmbedUrl: v.optional(v.string()),
    publishedAt: v.string(),
    regionScore: v.number(),
    pinned: v.boolean(),
    note: v.optional(v.string()),
    hash: v.string(),
    createdAt: v.string(),
  })
    .index("by_artist", ["artistId"])
    .index("by_artist_kind", ["artistId", "kind"])
    .index("by_hash", ["hash"])
    .index("by_published", ["publishedAt"]),
});

import { Region } from '../../lib/ranking'

export interface ItemInput {
  kind: 'news'
  title: string
  url: string
  oEmbedUrl?: string
  embedHtml?: string
  publishedAt: string
  source: {
    kind: 'news'
    domain?: string
    channelId?: string
    regionHints?: Region[]
  }
  externalId?: string
}

/**
 * Fetch recent news articles using Google News RSS with region-specific terms
 */
export async function fetchRecentRss(
  artistName: string,
  region: Region,
  sinceIso: string
): Promise<ItemInput[]> {
  try {
    // Build Google News RSS query with region terms
    const regionTerms = getRegionTerms(region)
    const query = regionTerms 
      ? `${artistName} ("interview" OR "music") ${regionTerms}`
      : `${artistName} ("interview" OR "music")`
    
    const regionCode = getGoogleNewsRegion(region)
    const params = new URLSearchParams({
      q: query,
      hl: `en-${regionCode}`,
      gl: regionCode,
      ceid: `${regionCode}:en`,
    })

    const rssUrl = `https://news.google.com/rss/search?${params}`
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'MusicLovers/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    })

    if (!response.ok) {
      console.error('Google News RSS error:', response.status)
      return []
    }

    const xmlText = await response.text()
    
    // Parse RSS XML
    const items = parseRssItems(xmlText, region, sinceIso)
    
    return items
  } catch (error) {
    console.error('News adapter error:', error)
    return []
  }
}

function getRegionTerms(region: Region): string {
  switch (region) {
    case 'ZA':
      return 'site:.za OR "South Africa"'
    case 'UK':
      return 'site:.uk OR "United Kingdom"'
    case 'EU':
      return '' // No specific terms for EU
    case 'GLOBAL':
    default:
      return ''
  }
}

function getGoogleNewsRegion(region: Region): string {
  switch (region) {
    case 'ZA':
      return 'ZA'
    case 'UK':
      return 'GB'
    case 'EU':
      return 'DE'
    case 'GLOBAL':
    default:
      return 'US'
  }
}

function parseRssItems(xmlText: string, region: Region, sinceIso: string): ItemInput[] {
  try {
    // Simple RSS parsing - in production, use a proper XML parser
    const items: ItemInput[] = []
    const sinceDate = new Date(sinceIso)
    
    // Extract items using regex (basic implementation)
    const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/g) || []
    
    for (const itemXml of itemMatches) {
      const title = extractXmlContent(itemXml, 'title')
      const link = extractXmlContent(itemXml, 'link')
      const pubDate = extractXmlContent(itemXml, 'pubDate')
      const source = extractXmlContent(itemXml, 'source')
      
      if (!title || !link) continue
      
      // Parse publication date
      let publishedAt = new Date().toISOString()
      if (pubDate) {
        const parsed = new Date(pubDate)
        if (!isNaN(parsed.getTime()) && parsed >= sinceDate) {
          publishedAt = parsed.toISOString()
        } else if (!isNaN(parsed.getTime()) && parsed < sinceDate) {
          continue // Skip items older than since date
        }
      }
      
      // Extract domain from URL
      let domain: string | undefined
      try {
        domain = new URL(link).hostname
      } catch {
        // Invalid URL, skip
        continue
      }
      
      items.push({
        kind: 'news',
        title: decodeHtmlEntities(title),
        url: link,
        publishedAt,
        source: {
          kind: 'news',
          domain,
          regionHints: region !== 'GLOBAL' ? [region] : [],
        },
        externalId: link, // Use URL as external ID for news
      })
    }
    
    return items
  } catch (error) {
    console.error('RSS parsing error:', error)
    return []
  }
}

function extractXmlContent(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  }
  
  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entities[entity] || entity
  })
}

import { test, expect } from '@playwright/test'

// T017: Integration test: ambiguous names flow
test.describe('Ambiguous Artist Names', () => {
  test('should show multiple candidates for ambiguous search', async ({ page }) => {
    // This test MUST FAIL until search disambiguation is implemented
    await page.goto('/')
    
    // Search for ambiguous name like "Phoenix"
    await page.fill('[data-testid="search-input"]', 'Phoenix')
    
    // Should show multiple candidates in dropdown
    await page.waitForSelector('[data-testid="search-results"]')
    
    const candidates = await page.locator('[data-testid="search-result"]').all()
    expect(candidates.length).toBeGreaterThan(1)
    
    // Each candidate should have distinguishing info
    for (const candidate of candidates) {
      await expect(candidate.locator('[data-testid="candidate-name"]')).toBeVisible()
      
      // Should show additional context like genre, image, or Spotify info
      const hasImage = await candidate.locator('[data-testid="candidate-image"]').count() > 0
      const hasGenre = await candidate.locator('[data-testid="candidate-genre"]').count() > 0
      const hasContext = await candidate.locator('[data-testid="candidate-context"]').count() > 0
      
      expect(hasImage || hasGenre || hasContext).toBe(true)
    }
  })

  test('should navigate to correct artist on selection', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('[data-testid="search-input"]', 'Phoenix')
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Click on second candidate
    await page.click('[data-testid="search-result"]:nth-child(2)')
    
    // Should navigate to that specific artist's page
    await page.waitForSelector('[data-testid="artist-page"]')
    
    // URL should reflect the selected artist
    expect(page.url()).toMatch(/\/artist\/.+/)
    
    // Artist name should be displayed
    await expect(page.locator('[data-testid="artist-name"]')).toBeVisible()
  })

  test('should not auto-map or assume artist identity', async ({ page }) => {
    await page.goto('/')
    
    // Search for ambiguous name
    await page.fill('[data-testid="search-input"]', 'Phoenix')
    
    // Should not automatically redirect to any single artist
    // Must require explicit user selection
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Verify we're still on search results, not auto-navigated
    expect(page.url()).toBe('/')
    
    // No artist page should be loaded without selection
    const artistPage = await page.locator('[data-testid="artist-page"]').count()
    expect(artistPage).toBe(0)
  })

  test('should show "no results" for truly unknown artists', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('[data-testid="search-input"]', 'XYZUnknownArtist123')
    
    // Should show no results or empty state
    await page.waitForTimeout(1000) // Brief wait for search
    
    const results = await page.locator('[data-testid="search-result"]').count()
    
    if (results === 0) {
      // Should show helpful "no results" message
      await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    }
  })

  test('should handle partial matches gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Search for partial name
    await page.fill('[data-testid="search-input"]', 'Black')
    
    // Should show fuzzy matches
    await page.waitForSelector('[data-testid="search-results"]')
    
    const results = await page.locator('[data-testid="search-result"]').all()
    
    // Should find artists with "Black" in name
    for (const result of results) {
      const candidateName = await result.locator('[data-testid="candidate-name"]').textContent()
      expect(candidateName?.toLowerCase()).toContain('black')
    }
  })
})

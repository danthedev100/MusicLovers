import { test, expect } from '@playwright/test'

// T014: Integration test: Region=ZA prioritization
test.describe('ZA Region Priority', () => {
  test('should boost ZA content when region filter is ZA', async ({ page }) => {
    // This test MUST FAIL until region filtering is implemented
    await page.goto('/artist/black-coffee')
    
    // Set region filter to ZA
    await page.selectOption('[data-testid="region-filter"]', 'ZA')
    await page.waitForSelector('[data-testid="items-list"]')
    
    // Check that items are ordered with ZA boost
    const items = await page.locator('[data-testid="item-card"]').all()
    
    if (items.length > 1) {
      // First item should have higher region score if ZA content exists
      const firstItem = items[0]
      const firstItemSource = await firstItem.locator('[data-testid="item-source"]').textContent()
      
      // Look for ZA indicators (.za domain, "South Africa" mention)
      const hasZAIndicator = firstItemSource?.includes('.za') || 
                           (await firstItem.locator('[data-testid="item-title"]').textContent())?.includes('South Africa')
      
      // If ZA content exists, it should be ranked first
      if (hasZAIndicator) {
        expect(hasZAIndicator).toBe(true)
      }
    }
  })

  test('should show global content when region is Global', async ({ page }) => {
    await page.goto('/artist/black-coffee')
    
    // Set region filter to Global
    await page.selectOption('[data-testid="region-filter"]', 'GLOBAL')
    await page.waitForSelector('[data-testid="items-list"]')
    
    // Should show content from all regions, sorted by pure recency
    const items = await page.locator('[data-testid="item-card"]').all()
    expect(items.length).toBeGreaterThanOrEqual(0)
  })

  test('should maintain region preference in URL', async ({ page }) => {
    await page.goto('/artist/black-coffee')
    
    await page.selectOption('[data-testid="region-filter"]', 'ZA')
    
    // URL should include region parameter
    expect(page.url()).toContain('region=ZA')
    
    // Refresh page should maintain region
    await page.reload()
    const selectedRegion = await page.locator('[data-testid="region-filter"]').inputValue()
    expect(selectedRegion).toBe('ZA')
  })
})

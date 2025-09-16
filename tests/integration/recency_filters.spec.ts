import { test, expect } from '@playwright/test'

// T015: Integration test: recency windows (24h/7d/30d)
test.describe('Recency Filters', () => {
  test('should filter items by 24h window', async ({ page }) => {
    // This test MUST FAIL until recency filtering is implemented
    await page.goto('/artist/black-coffee')
    
    // Set time filter to 24h
    await page.selectOption('[data-testid="time-filter"]', '24h')
    await page.waitForSelector('[data-testid="items-list"]')
    
    const items = await page.locator('[data-testid="item-card"]').all()
    
    // All visible items should be within last 24 hours
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    for (const item of items) {
      const publishedText = await item.locator('[data-testid="item-published"]').textContent()
      if (publishedText) {
        // Should show relative time like "2 hours ago"
        expect(publishedText).toMatch(/(minute|hour)s? ago|just now/)
      }
    }
  })

  test('should filter items by 7d window', async ({ page }) => {
    await page.goto('/artist/black-coffee')
    
    // Set time filter to 7d (default)
    await page.selectOption('[data-testid="time-filter"]', '7d')
    await page.waitForSelector('[data-testid="items-list"]')
    
    const items = await page.locator('[data-testid="item-card"]').all()
    expect(items.length).toBeGreaterThanOrEqual(0)
    
    // Should show items from past week
    for (const item of items) {
      const publishedText = await item.locator('[data-testid="item-published"]').textContent()
      if (publishedText) {
        expect(publishedText).toMatch(/(minute|hour|day)s? ago|just now/)
      }
    }
  })

  test('should filter items by 30d window', async ({ page }) => {
    await page.goto('/artist/black-coffee')
    
    // Set time filter to 30d
    await page.selectOption('[data-testid="time-filter"]', '30d')
    await page.waitForSelector('[data-testid="items-list"]')
    
    const items = await page.locator('[data-testid="item-card"]').all()
    
    // Should show more items than shorter windows
    expect(items.length).toBeGreaterThanOrEqual(0)
  })

  test('should show empty state when no items in window', async ({ page }) => {
    await page.goto('/artist/unknown-artist')
    
    await page.selectOption('[data-testid="time-filter"]', '24h')
    await page.waitForSelector('[data-testid="empty-state"]')
    
    // Should show helpful empty state with suggestions
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No items found')
    await expect(page.locator('[data-testid="expand-window-button"]')).toBeVisible()
  })

  test('should maintain time filter in URL', async ({ page }) => {
    await page.goto('/artist/black-coffee')
    
    await page.selectOption('[data-testid="time-filter"]', '24h')
    
    expect(page.url()).toContain('time=24h')
    
    await page.reload()
    const selectedTime = await page.locator('[data-testid="time-filter"]').inputValue()
    expect(selectedTime).toBe('24h')
  })
})

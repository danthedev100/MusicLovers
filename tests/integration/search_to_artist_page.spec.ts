import { test, expect } from '@playwright/test'

// T013: Integration test: search → artist page TTI <2.5s
test.describe('Search to Artist Page Performance', () => {
  test('should load artist page within 2.5s TTI on mobile viewport', async ({ page }) => {
    // This test MUST FAIL until pages are implemented
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    
    const startTime = Date.now()
    
    // Navigate to home page
    await page.goto('/')
    
    // Search for artist
    await page.fill('[data-testid="search-input"]', 'Black Coffee')
    await page.click('[data-testid="search-result-0"]') // First suggestion
    
    // Wait for artist page to be interactive
    await page.waitForSelector('[data-testid="artist-page"]')
    await page.waitForSelector('[data-testid="items-list"]')
    
    const endTime = Date.now()
    const tti = endTime - startTime
    
    expect(tti).toBeLessThanOrEqual(2500) // 2.5s TTI requirement
  })

  test('should show loading states during navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    await page.fill('[data-testid="search-input"]', 'Black Coffee')
    
    // Should show loading skeleton during search
    await expect(page.locator('[data-testid="search-loading"]')).toBeVisible()
    
    await page.click('[data-testid="search-result-0"]')
    
    // Should show skeleton while loading artist page
    await expect(page.locator('[data-testid="items-skeleton"]')).toBeVisible()
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }) // iPhone 5/SE
    
    await page.goto('/artist/black-coffee')
    
    // All interactive elements should be >= 44px touch targets
    const buttons = await page.locator('button').all()
    for (const button of buttons) {
      const box = await button.boundingBox()
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })
})

import { test, expect } from '@playwright/test'

// T016: Integration test: embeds and fallbacks
test.describe('Embeds and Fallbacks', () => {
  test('should show playable embeds when available', async ({ page }) => {
    // This test MUST FAIL until embed components are implemented
    await page.goto('/artist/black-coffee')
    
    // Look for YouTube tab and items
    await page.click('[data-testid="tab-youtube"]')
    await page.waitForSelector('[data-testid="items-list"]')
    
    const items = await page.locator('[data-testid="item-card"]').all()
    
    if (items.length > 0) {
      const firstItem = items[0]
      
      // Should have either embed or link card
      const hasEmbed = await firstItem.locator('[data-testid="embed-container"]').count() > 0
      const hasLinkCard = await firstItem.locator('[data-testid="link-card"]').count() > 0
      
      expect(hasEmbed || hasLinkCard).toBe(true)
      
      // If embed exists, should be responsive
      if (hasEmbed) {
        const embed = firstItem.locator('[data-testid="embed-container"]')
        const box = await embed.boundingBox()
        expect(box?.width).toBeGreaterThan(0)
      }
    }
  })

  test('should lazy load embeds until interaction', async ({ page }) => {
    await page.goto('/artist/black-coffee')
    await page.click('[data-testid="tab-youtube"]')
    
    const embedContainers = await page.locator('[data-testid="embed-container"]').all()
    
    for (const container of embedContainers) {
      // Should show placeholder or click-to-activate initially
      const hasPlaceholder = await container.locator('[data-testid="embed-placeholder"]').count() > 0
      const hasActivateButton = await container.locator('[data-testid="activate-embed"]').count() > 0
      
      expect(hasPlaceholder || hasActivateButton).toBe(true)
    }
  })

  test('should activate embed on click', async ({ page }) => {
    await page.goto('/artist/black-coffee')
    await page.click('[data-testid="tab-youtube"]')
    
    const firstEmbed = page.locator('[data-testid="embed-container"]').first()
    const activateButton = firstEmbed.locator('[data-testid="activate-embed"]')
    
    if (await activateButton.count() > 0) {
      await activateButton.click()
      
      // Should load actual iframe after activation
      await expect(firstEmbed.locator('iframe')).toBeVisible()
    }
  })

  test('should show link cards for restricted content', async ({ page }) => {
    await page.goto('/artist/black-coffee')
    await page.click('[data-testid="tab-soundcloud"]')
    
    const items = await page.locator('[data-testid="item-card"]').all()
    
    if (items.length > 0) {
      const itemsWithLinkCards = await page.locator('[data-testid="link-card"]').count()
      
      // Should have link cards when embeds aren't available
      if (itemsWithLinkCards > 0) {
        const linkCard = page.locator('[data-testid="link-card"]').first()
        
        // Link card should have title, source, and external link
        await expect(linkCard.locator('[data-testid="card-title"]')).toBeVisible()
        await expect(linkCard.locator('[data-testid="card-source"]')).toBeVisible()
        await expect(linkCard.locator('[data-testid="external-link"]')).toBeVisible()
      }
    }
  })

  test('should respect reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    await page.goto('/artist/black-coffee')
    
    // Animations should be minimal/instant
    const computedStyle = await page.evaluate(() => {
      const elem = document.querySelector('[data-testid="tab-all"]')
      return elem ? getComputedStyle(elem).transitionDuration : null
    })
    
    // Should have minimal or no transition duration
    expect(computedStyle).toMatch(/0\.01ms|0s|none/)
  })
})

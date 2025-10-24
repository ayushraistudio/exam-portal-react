import { test, expect } from '@playwright/test'

test.describe('Contest Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: {
            uid: 'student-1',
            username: 'teststudent',
            role: 'student'
          },
          sessionId: 'session-123'
        }
      }))
    })
  })

  test('should display contest page with security measures', async ({ page }) => {
    // Mock contest data
    await page.route('**/api/contests/contest-1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'contest-1',
            title: 'Math Quiz',
            status: 'running',
            duration: 3600,
            totalQuestions: 2
          }
        })
      })
    })

    await page.route('**/api/contests/contest-1/questions', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'q1',
              order: 1,
              text: 'What is 2 + 2?',
              options: ['3', '4', '5', '6'],
              points: 10
            },
            {
              id: 'q2',
              order: 2,
              text: 'What is 3 + 3?',
              options: ['5', '6', '7', '8'],
              points: 10
            }
          ]
        })
      })
    })

    await page.goto('/contest/contest-1')

    // Check if exam mode is enabled
    await expect(page.locator('body')).toHaveClass(/exam-mode/)

    // Check if watermark is present
    await expect(page.locator('canvas')).toBeVisible()

    // Check if timer is displayed
    await expect(page.locator('.timer')).toBeVisible()

    // Check if questions are rendered
    await expect(page.locator('text=Question 1 of 2')).toBeVisible()
    await expect(page.locator('text=What is 2 + 2?')).toBeVisible()
  })

  test('should prevent right-click during exam', async ({ page }) => {
    await page.goto('/contest/contest-1')

    // Try to right-click
    await page.click('body', { button: 'right' })

    // Should show error message
    await expect(page.locator('text=Right-click is disabled during the exam')).toBeVisible()
  })

  test('should prevent keyboard shortcuts during exam', async ({ page }) => {
    await page.goto('/contest/contest-1')

    // Try to open developer tools (F12)
    await page.keyboard.press('F12')

    // Should show error message
    await expect(page.locator('text=This keyboard shortcut is disabled during the exam')).toBeVisible()

    // Try Ctrl+U (view source)
    await page.keyboard.press('Control+u')

    // Should show error message
    await expect(page.locator('text=This keyboard shortcut is disabled during the exam')).toBeVisible()
  })

  test('should handle window minimize detection', async ({ page }) => {
    await page.goto('/contest/contest-1')

    // Mock visibility change
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Wait for the warning
    await expect(page.locator('text=Please avoid minimizing the window')).toBeVisible()
  })

  test('should auto-save answers', async ({ page }) => {
    // Mock answer submission
    await page.route('**/api/contests/contest-1/answers', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Answer saved successfully'
        })
      })
    })

    await page.goto('/contest/contest-1')

    // Click on an answer option
    await page.click('canvas')

    // Should show save confirmation
    await expect(page.locator('text=Answer saved successfully')).toBeVisible()
  })

  test('should submit contest successfully', async ({ page }) => {
    // Mock contest submission
    await page.route('**/api/contests/contest-1/submit', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Contest submitted successfully'
        })
      })
    })

    await page.goto('/contest/contest-1')

    // Click submit button
    await page.click('button:has-text("Submit")')

    // Should show success message
    await expect(page.locator('text=Contest submitted successfully')).toBeVisible()
  })

  test('should handle rejoin request when logged out', async ({ page }) => {
    // Mock rejoin request
    await page.route('**/api/rejoin/request', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Rejoin request submitted successfully'
        })
      })
    })

    await page.goto('/contest/contest-1')

    // Simulate logout due to minimize
    await page.evaluate(() => {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    })

    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})

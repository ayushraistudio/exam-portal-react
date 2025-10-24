import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/MCQ Competition Portal/)
    await expect(page.locator('h2')).toContainText('MCQ Competition Portal')
    await expect(page.locator('text=Select User Type')).toBeVisible()
  })

  test('should switch between admin and student login', async ({ page }) => {
    // Default should be student
    await expect(page.locator('button:has-text("Student")')).toHaveClass(/border-primary-500/)
    
    // Click admin
    await page.click('button:has-text("Admin")')
    await expect(page.locator('button:has-text("Admin")')).toHaveClass(/border-primary-500/)
    await expect(page.locator('button:has-text("Student")')).not.toHaveClass(/border-primary-500/)
    
    // Click student again
    await page.click('button:has-text("Student")')
    await expect(page.locator('button:has-text("Student")')).toHaveClass(/border-primary-500/)
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Username is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should handle login failure', async ({ page }) => {
    // Mock failed login
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' })
      })
    })

    await page.fill('input[name="username"]', 'invaliduser')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('should login successfully as student', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              uid: 'student-1',
              username: 'teststudent',
              role: 'student',
              email: 'test@example.com'
            },
            sessionId: 'session-123'
          }
        })
      })
    })

    await page.fill('input[name="username"]', 'teststudent')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should redirect to student dashboard
    await expect(page).toHaveURL('/student')
  })

  test('should login successfully as admin', async ({ page }) => {
    // Mock successful admin login
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              uid: 'admin-1',
              username: 'admin',
              role: 'admin',
              email: 'admin@example.com'
            },
            sessionId: 'session-456'
          }
        })
      })
    })

    await page.click('button:has-text("Admin")')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin')
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]')
    const toggleButton = page.locator('button[type="button"]').last()

    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle button
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

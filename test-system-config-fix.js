const puppeteer = require('puppeteer');

async function testSystemConfigNavigation() {
  console.log('🧪 Testing System Config button navigation...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
      console.log('Browser Console:', msg.text());
    });

    // Navigate to admin dashboard
    console.log('📱 Navigating to admin dashboard...');
    await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle2' });

    // Wait for the page to load
    await page.waitForTimeout(3000);

    // Check if we're redirected to login
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('❌ Redirected to login page - authentication issue detected');

      // Try to login with super admin credentials
      console.log('🔐 Attempting to login...');
      await page.type('input[type="email"]', 'superadmin@forwardafrica.com');
      await page.type('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(3000);

      // Check if login was successful
      const newUrl = page.url();
      console.log('📍 URL after login:', newUrl);

      if (newUrl.includes('/admin/dashboard')) {
        console.log('✅ Login successful, now testing System Config button...');
      } else {
        console.log('❌ Login failed');
        return;
      }
    }

    // Look for the System Config button in Super Admin Controls
    console.log('🔍 Looking for System Config button...');

    // Wait for the Super Admin Controls section to load
    await page.waitForSelector('.bg-gradient-to-r.from-purple-900\\/20.to-blue-900\\/20', { timeout: 10000 });

    // Find the System Config button
    const systemConfigButton = await page.$('button:has-text("System Config")');

    if (!systemConfigButton) {
      console.log('❌ System Config button not found');
      return;
    }

    console.log('✅ System Config button found, clicking...');

    // Click the System Config button
    await systemConfigButton.click();

    // Wait for navigation
    await page.waitForTimeout(3000);

    // Check the new URL
    const finalUrl = page.url();
    console.log('📍 Final URL after clicking System Config:', finalUrl);

    if (finalUrl.includes('/admin/system-configuration')) {
      console.log('✅ SUCCESS: System Config button navigated to correct page');
    } else if (finalUrl.includes('/login')) {
      console.log('❌ FAILED: System Config button redirected to login page');
    } else {
      console.log('⚠️ UNEXPECTED: System Config button navigated to:', finalUrl);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'system-config-test-result.png', fullPage: true });
    console.log('📸 Screenshot saved as system-config-test-result.png');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testSystemConfigNavigation().catch(console.error);
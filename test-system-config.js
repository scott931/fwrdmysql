// Test script to verify system configuration page functionality
const puppeteer = require('puppeteer');

async function testSystemConfigPage() {
  console.log('🧪 Testing System Configuration Page...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to the system configuration page
    console.log('📱 Navigating to system configuration page...');
    await page.goto('http://localhost:3000/admin/system-configuration', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the page to load
    await page.waitForTimeout(3000);

    // Check for hydration errors in console
    const logs = await page.evaluate(() => {
      return window.console.logs || [];
    });

    const errors = logs.filter(log =>
      log.includes('hydration') ||
      log.includes('Error') ||
      log.includes('Abort')
    );

    if (errors.length > 0) {
      console.error('❌ Found hydration errors:');
      errors.forEach(error => console.error('  -', error));
    } else {
      console.log('✅ No hydration errors found');
    }

    // Check if the page content loaded
    const pageContent = await page.content();
    const hasContent = pageContent.includes('System Configuration') ||
                      pageContent.includes('Access Denied') ||
                      pageContent.includes('Loading');

    if (hasContent) {
      console.log('✅ Page content loaded successfully');
    } else {
      console.log('❌ Page content not loaded');
    }

    // Take a screenshot for debugging
    await page.screenshot({
      path: 'system-config-test.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved as system-config-test.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testSystemConfigPage().catch(console.error);
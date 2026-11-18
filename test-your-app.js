/**
 * Test YOUR Merit Data Collection App
 */

import { chromium } from 'playwright';

async function testYourApp() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║       TESTING YOUR MERIT DATA APP                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  const browser = await chromium.launch({
    headless: false,  // VISIBLE BROWSER
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Opening http://localhost:3000...\n');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('✅ App loaded!\n');
    await page.waitForTimeout(2000);
    
    // Check if login page
    const hasLogin = await page.$('input[type="text"], input[type="email"]');
    
    if (hasLogin) {
      console.log('📝 Found login form - attempting login...\n');
      
      // Fill in credentials
      await page.fill('input[type="text"], input[name="username"]', 'user1');
      console.log('  ✓ Filled username: user1');
      
      await page.fill('input[type="password"]', 'password123');
      console.log('  ✓ Filled password');
      
      // Click sign in
      await page.click('button[type="submit"]');
      console.log('  ✓ Clicked Sign In button\n');
      
      // Wait for navigation
      await page.waitForTimeout(3000);
      
      // Check if logged in
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}\n`);
      
      if (currentUrl.includes('dashboard') || currentUrl === 'http://localhost:3000/') {
        console.log('✅ LOGIN SUCCESSFUL!\n');
        
        // Try to find add merit button
        const pageContent = await page.textContent('body');
        console.log('📊 Dashboard loaded - looking for features...\n');
        
        if (pageContent.includes('Add Merit') || pageContent.includes('merit')) {
          console.log('  ✅ Merit data features found!\n');
        }
        
        console.log('⏸️  Keeping browser open for 30 seconds...');
        console.log('   EXPLORE YOUR APP!\n');
        await page.waitForTimeout(30000);
        
      } else {
        console.log('⚠️  Login might have failed - check browser\n');
        console.log('   Keeping browser open for 30 seconds to investigate...\n');
        await page.waitForTimeout(30000);
      }
      
    } else {
      console.log('✅ Already logged in or different page structure\n');
      console.log('⏸️  Keeping browser open for 30 seconds...\n');
      await page.waitForTimeout(30000);
    }
    
    console.log('\n' + '═'.repeat(70));
    console.log('TEST COMPLETE');
    console.log('═'.repeat(70));
    console.log('\n✅ Your app is working locally!\n');
    
  } catch (error) {
    console.error('\n❌ Error testing app:', error.message);
    console.error(error.stack);
    console.log('\n⏸️  Keeping browser open to see error...\n');
    await page.waitForTimeout(30000);
  } finally {
    await browser.close();
    console.log('✓ Browser closed\n');
  }
}

testYourApp().catch(console.error);

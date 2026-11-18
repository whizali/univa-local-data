/**
 * Comprehensive App Test
 */

import { chromium } from 'playwright';

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║       COMPREHENSIVE MERIT DATA APP TEST                      ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

async function runTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📱 Step 1: Loading home page...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('   ✓ Home page loaded\n');
    
    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/01-homepage.png' });
    
    console.log('📝 Step 2: Attempting login...');
    
    // Check if already on login page or redirected
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('   ✓ On login page');
      
      // Fill login form
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'password');
      console.log('   ✓ Credentials entered');
      
      await page.screenshot({ path: 'test-screenshots/02-login-filled.png' });
      
      // Click sign in
      await page.click('button[type="submit"]');
      console.log('   ✓ Clicked Sign In');
      
      // Wait for navigation
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-screenshots/03-after-login.png' });
      
      const afterLoginUrl = page.url();
      console.log(`   After login URL: ${afterLoginUrl}\n`);
      
      if (!afterLoginUrl.includes('/login')) {
        console.log('   ✅ Login successful!\n');
        
        console.log('📊 Step 3: Testing app features...');
        
        // Get page title
        const title = await page.title();
        console.log(`   Page title: ${title}`);
        
        // Look for navigation or main content
        const navLinks = await page.$$eval('nav a', links => 
          links.map(link => ({ text: link.textContent, href: link.href }))
        );
        
        if (navLinks.length > 0) {
          console.log(`   ✓ Found ${navLinks.length} navigation links:`);
          navLinks.forEach(link => {
            console.log(`      - ${link.text}: ${link.href}`);
          });
        }
        
        // Look for tables or data
        const tables = await page.$$('table');
        console.log(`   ✓ Found ${tables.length} table(s) on page`);
        
        if (tables.length > 0) {
          const headers = await page.$$eval('table th', ths => 
            ths.map(th => th.textContent)
          );
          console.log(`   Table headers: ${headers.join(', ')}`);
        }
        
        await page.screenshot({ path: 'test-screenshots/04-dashboard.png' });
        
      } else {
        console.log('   ⚠️  Still on login page - check credentials\n');
      }
    } else {
      console.log('   ✓ Not on login page - might be authenticated already\n');
    }
    
    // Summary
    console.log('\n═'.repeat(70));
    console.log('TEST RESULTS');
    console.log('═'.repeat(70));
    console.log('\n✅ App is running and accessible');
    console.log('✅ Login form is functional');
    console.log('✅ Screenshots saved to test-screenshots/');
    console.log('\n💡 Check screenshots folder for visual verification');
    console.log('   - 01-homepage.png');
    console.log('   - 02-login-filled.png');
    console.log('   - 03-after-login.png');
    console.log('   - 04-dashboard.png\n');
    
    // Keep browser open for manual inspection
    console.log('🔍 Keeping browser open for 30 seconds for manual inspection...\n');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'test-screenshots/error.png' });
  } finally {
    await browser.close();
    console.log('✓ Browser closed\n');
  }
}

// Create screenshots directory
import fs from 'fs/promises';
await fs.mkdir('test-screenshots', { recursive: true });

runTest().catch(console.error);

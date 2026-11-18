/**
 * Live App Testing - Vercel Deployment
 * Tests the production app in headed mode to identify bugs
 */

import { chromium } from 'playwright';

const LIVE_APP_URL = 'https://merit-data-12uyzqc53-ali-hassans-projects-06bc8c2b.vercel.app';

async function testLiveApp() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║       TESTING LIVE VERCEL APP (HEADED MODE)                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`🌐 Testing: ${LIVE_APP_URL}\n`);
  
  const bugs = [];
  const warnings = [];
  
  // Launch browser in headed mode so you can see what's happening
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions to see them
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // ========================================================================
    // TEST 1: Homepage Load
    // ========================================================================
    console.log('📋 TEST 1: Homepage Load');
    
    await page.goto(LIVE_APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('  ✓ Homepage loaded');
    
    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        bugs.push({
          test: 'Console Errors',
          severity: 'HIGH',
          issue: msg.text()
        });
      }
    });
    
    // Check page title
    const title = await page.title();
    console.log(`  ✓ Title: ${title}`);
    
    if (!title || title === 'React App' || title.includes('404')) {
      bugs.push({
        test: 'Homepage',
        severity: 'MEDIUM',
        issue: `Incorrect or missing page title: "${title}"`
      });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/01-homepage.png', fullPage: true });
    console.log('  ✓ Screenshot saved: 01-homepage.png\n');
    
    await page.waitForTimeout(2000);
    
    // ========================================================================
    // TEST 2: Navigation Links
    // ========================================================================
    console.log('📋 TEST 2: Navigation Links');
    
    const navLinks = await page.$$eval('nav a, header a', links => 
      links.map(link => ({
        text: link.textContent.trim(),
        href: link.href
      }))
    );
    
    console.log(`  ✓ Found ${navLinks.length} navigation links`);
    navLinks.forEach(link => console.log(`     - ${link.text}: ${link.href}`));
    
    if (navLinks.length === 0) {
      bugs.push({
        test: 'Navigation',
        severity: 'HIGH',
        issue: 'No navigation links found'
      });
    }
    console.log();
    
    // ========================================================================
    // TEST 3: Check for Sign In / Sign Up
    // ========================================================================
    console.log('📋 TEST 3: Authentication Links');
    
    const hasSignIn = await page.locator('text=/sign in|login/i').count() > 0;
    const hasSignUp = await page.locator('text=/sign up|register/i').count() > 0;
    
    console.log(`  Sign In link: ${hasSignIn ? '✓ Found' : '✗ Missing'}`);
    console.log(`  Sign Up link: ${hasSignUp ? '✓ Found' : '✗ Missing'}`);
    
    if (!hasSignIn && !hasSignUp) {
      bugs.push({
        test: 'Authentication',
        severity: 'HIGH',
        issue: 'No sign in/sign up links found'
      });
    }
    console.log();
    
    // ========================================================================
    // TEST 4: Try to Access Sign In Page
    // ========================================================================
    console.log('📋 TEST 4: Sign In Page');
    
    try {
      await page.goto(`${LIVE_APP_URL}/signin`, { waitUntil: 'networkidle', timeout: 10000 });
      
      const url = page.url();
      console.log(`  Current URL: ${url}`);
      
      // Check if we got a 404 or were redirected
      const has404 = await page.locator('text=/404|not found/i').count() > 0;
      
      if (has404) {
        bugs.push({
          test: 'Sign In Page',
          severity: 'HIGH',
          issue: 'Sign In page returns 404 - route not configured'
        });
        console.log('  ✗ Sign In page not found (404)');
      } else {
        console.log('  ✓ Sign In page accessible');
        
        // Check for form elements
        const hasEmailInput = await page.locator('input[type="email"], input[name="email"]').count() > 0;
        const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
        const hasSubmitButton = await page.locator('button[type="submit"], button:has-text("Sign In")').count() > 0;
        
        console.log(`  Email input: ${hasEmailInput ? '✓' : '✗'}`);
        console.log(`  Password input: ${hasPasswordInput ? '✓' : '✗'}`);
        console.log(`  Submit button: ${hasSubmitButton ? '✓' : '✗'}`);
        
        if (!hasEmailInput || !hasPasswordInput || !hasSubmitButton) {
          bugs.push({
            test: 'Sign In Form',
            severity: 'HIGH',
            issue: 'Sign in form is incomplete or missing elements'
          });
        }
      }
      
      await page.screenshot({ path: 'test-screenshots/02-signin.png', fullPage: true });
      console.log('  ✓ Screenshot saved: 02-signin.png\n');
      
    } catch (error) {
      bugs.push({
        test: 'Sign In Page',
        severity: 'HIGH',
        issue: `Failed to access sign in page: ${error.message}`
      });
      console.log(`  ✗ Error: ${error.message}\n`);
    }
    
    await page.waitForTimeout(2000);
    
    // ========================================================================
    // TEST 5: Try Sign Up Page
    // ========================================================================
    console.log('📋 TEST 5: Sign Up Page');
    
    try {
      await page.goto(`${LIVE_APP_URL}/signup`, { waitUntil: 'networkidle', timeout: 10000 });
      
      const has404 = await page.locator('text=/404|not found/i').count() > 0;
      
      if (has404) {
        bugs.push({
          test: 'Sign Up Page',
          severity: 'HIGH',
          issue: 'Sign Up page returns 404 - route not configured'
        });
        console.log('  ✗ Sign Up page not found (404)');
      } else {
        console.log('  ✓ Sign Up page accessible');
        
        const hasNameInput = await page.locator('input[name="name"], input[placeholder*="name" i]').count() > 0;
        const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
        const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
        const hasSubmitButton = await page.locator('button[type="submit"]').count() > 0;
        
        console.log(`  Name input: ${hasNameInput ? '✓' : '✗'}`);
        console.log(`  Email input: ${hasEmailInput ? '✓' : '✗'}`);
        console.log(`  Password input: ${hasPasswordInput ? '✓' : '✗'}`);
        console.log(`  Submit button: ${hasSubmitButton ? '✓' : '✗'}`);
        
        if (!hasEmailInput || !hasPasswordInput) {
          bugs.push({
            test: 'Sign Up Form',
            severity: 'HIGH',
            issue: 'Sign up form is incomplete'
          });
        }
      }
      
      await page.screenshot({ path: 'test-screenshots/03-signup.png', fullPage: true });
      console.log('  ✓ Screenshot saved: 03-signup.png\n');
      
    } catch (error) {
      bugs.push({
        test: 'Sign Up Page',
        severity: 'HIGH',
        issue: `Failed to access sign up page: ${error.message}`
      });
      console.log(`  ✗ Error: ${error.message}\n`);
    }
    
    await page.waitForTimeout(2000);
    
    // ========================================================================
    // TEST 6: Check Dashboard Route
    // ========================================================================
    console.log('📋 TEST 6: Dashboard Route');
    
    try {
      await page.goto(`${LIVE_APP_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 10000 });
      
      const url = page.url();
      console.log(`  Current URL: ${url}`);
      
      // Should redirect to sign in if not authenticated
      if (url.includes('/signin')) {
        console.log('  ✓ Properly redirects to sign in when not authenticated');
      } else if (url.includes('/dashboard')) {
        warnings.push({
          test: 'Dashboard Protection',
          severity: 'MEDIUM',
          issue: 'Dashboard may not be properly protected - accessible without auth'
        });
        console.log('  ⚠️  Dashboard accessible without authentication');
      }
      
      await page.screenshot({ path: 'test-screenshots/04-dashboard.png', fullPage: true });
      console.log('  ✓ Screenshot saved: 04-dashboard.png\n');
      
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}\n`);
    }
    
    await page.waitForTimeout(2000);
    
    // ========================================================================
    // TEST 7: API Endpoints
    // ========================================================================
    console.log('📋 TEST 7: API Endpoints');
    
    const apiTests = [
      { endpoint: '/api/auth/signin', method: 'GET', expectedStatus: [200, 405] },
      { endpoint: '/api/universities', method: 'GET', expectedStatus: [200, 401] },
      { endpoint: '/api/programs', method: 'GET', expectedStatus: [200, 401] }
    ];
    
    for (const test of apiTests) {
      try {
        const response = await page.goto(`${LIVE_APP_URL}${test.endpoint}`, { 
          waitUntil: 'networkidle', 
          timeout: 10000 
        });
        
        const status = response.status();
        const isExpected = test.expectedStatus.includes(status);
        
        console.log(`  ${test.endpoint}: ${status} ${isExpected ? '✓' : '✗'}`);
        
        if (!isExpected) {
          bugs.push({
            test: `API ${test.endpoint}`,
            severity: 'MEDIUM',
            issue: `Unexpected status ${status}, expected ${test.expectedStatus.join(' or ')}`
          });
        }
      } catch (error) {
        bugs.push({
          test: `API ${test.endpoint}`,
          severity: 'MEDIUM',
          issue: `Failed to reach endpoint: ${error.message}`
        });
        console.log(`  ${test.endpoint}: ✗ ${error.message}`);
      }
    }
    console.log();
    
    // ========================================================================
    // TEST 8: Responsive Design
    // ========================================================================
    console.log('📋 TEST 8: Responsive Design');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(LIVE_APP_URL, { waitUntil: 'networkidle' });
    
    await page.screenshot({ path: 'test-screenshots/05-mobile.png', fullPage: true });
    console.log('  ✓ Mobile screenshot saved: 05-mobile.png');
    
    // Check for hamburger menu or mobile navigation
    const hasMobileNav = await page.locator('button[aria-label*="menu" i], .hamburger, .mobile-menu').count() > 0;
    console.log(`  Mobile navigation: ${hasMobileNav ? '✓ Found' : '⚠️  Not found'}`);
    
    if (!hasMobileNav) {
      warnings.push({
        test: 'Mobile Design',
        severity: 'LOW',
        issue: 'No mobile navigation menu found'
      });
    }
    
    // Restore desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log();
    
    await page.waitForTimeout(2000);
    
    // ========================================================================
    // REPORT RESULTS
    // ========================================================================
    console.log('\n' + '═'.repeat(70));
    console.log('TEST RESULTS SUMMARY');
    console.log('═'.repeat(70) + '\n');
    
    console.log(`🎯 App URL: ${LIVE_APP_URL}\n`);
    
    if (bugs.length === 0 && warnings.length === 0) {
      console.log('✅ NO BUGS FOUND! App appears to be working correctly.\n');
    } else {
      if (bugs.length > 0) {
        console.log(`🐛 BUGS FOUND: ${bugs.length}\n`);
        bugs.forEach((bug, i) => {
          console.log(`${i + 1}. [${bug.severity}] ${bug.test}`);
          console.log(`   ${bug.issue}\n`);
        });
      }
      
      if (warnings.length > 0) {
        console.log(`⚠️  WARNINGS: ${warnings.length}\n`);
        warnings.forEach((warning, i) => {
          console.log(`${i + 1}. [${warning.severity}] ${warning.test}`);
          console.log(`   ${warning.issue}\n`);
        });
      }
    }
    
    console.log('📸 Screenshots saved in: test-screenshots/');
    console.log('   - 01-homepage.png');
    console.log('   - 02-signin.png');
    console.log('   - 03-signup.png');
    console.log('   - 04-dashboard.png');
    console.log('   - 05-mobile.png\n');
    
    console.log('💡 Browser will remain open for 30 seconds for manual inspection...\n');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('✓ Browser closed\n');
  }
}

// Run the test
testLiveApp()
  .then(() => {
    console.log('🎉 Testing complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });

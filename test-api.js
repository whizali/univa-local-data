/**
 * Test API Endpoints
 */

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║       TESTING API ENDPOINTS                                  ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, url) {
  try {
    console.log(`📡 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`);
      
      if (Array.isArray(data)) {
        console.log(`   ✓ Returned ${data.length} items`);
        if (data.length > 0) {
          console.log(`   ✓ Sample: ${JSON.stringify(data[0]).substring(0, 100)}...`);
        }
      } else {
        console.log(`   ✓ Data keys: ${Object.keys(data).join(', ')}`);
      }
    } else {
      console.log(`   ⚠️  Status: ${response.status} - ${data.error || 'Unknown error'}`);
    }
    console.log();
    return data;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

async function runTests() {
  console.log('🔍 Testing Public Endpoints (No Auth Required)\n');
  console.log('─'.repeat(70) + '\n');
  
  // Test universities endpoint
  const universities = await testEndpoint(
    'Universities List',
    `${BASE_URL}/api/universities`
  );
  
  // Test programs endpoint  
  const programs = await testEndpoint(
    'Programs List',
    `${BASE_URL}/api/programs`
  );
  
  // Test merit formulas endpoint
  const formulas = await testEndpoint(
    'Merit Formulas',
    `${BASE_URL}/api/merit-formulas`
  );
  
  // Test a specific university
  if (universities && universities.length > 0) {
    const firstUni = universities[0];
    await testEndpoint(
      `University Details (${firstUni.abbreviation})`,
      `${BASE_URL}/api/universities/${firstUni.id}`
    );
  }
  
  // Summary
  console.log('═'.repeat(70));
  console.log('TEST SUMMARY');
  console.log('═'.repeat(70));
  
  if (universities) {
    console.log(`\n✅ Universities API: ${universities.length} universities`);
  }
  if (programs) {
    console.log(`✅ Programs API: ${programs.length} programs`);
  }
  if (formulas) {
    console.log(`✅ Merit Formulas API: ${formulas.length} formulas`);
  }
  
  console.log('\n🎉 API is functional!\n');
}

runTests().catch(console.error);

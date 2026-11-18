/**
 * Test seed-data.sql by counting records and validating structure
 */

import { readFile } from 'fs/promises';

async function testSeedData() {
  console.log('\n🧪 Testing seed-data.sql structure...\n');
  
  try {
    const content = await readFile('./seed-data.sql', 'utf8');
    
    // Count INSERT statements
    const userInserts = (content.match(/INSERT INTO users/g) || []).length;
    const universityInserts = (content.match(/INSERT INTO universities/g) || []).length;
    const formulaInserts = (content.match(/INSERT INTO merit_formulas/g) || []).length;
    const programInserts = (content.match(/INSERT INTO programs/g) || []).length;
    
    // Count VALUES entries
    const userValues = (content.match(/INSERT INTO users[\s\S]*?VALUES[\s\S]*?;/)[0].match(/\([^)]+\)/g) || []).length - 1; // -1 for column list
    
    console.log('📊 Record Counts:\n');
    console.log(`  Users: ${userValues} entries`);
    
    // Count universities (more complex due to multi-line)
    const universitySection = content.match(/INSERT INTO universities[\s\S]*?ON CONFLICT/)[0];
    const universityEntries = (universitySection.match(/^\(\d+,/gm) || []).length;
    console.log(`  Universities: ${universityEntries} entries`);
    
    // Count formulas
    const formulaSection = content.match(/INSERT INTO merit_formulas[\s\S]*?ON CONFLICT/)[0];
    const formulaEntries = (formulaSection.match(/^\(\d+,/gm) || []).length;
    console.log(`  Merit Formulas: ${formulaEntries} entries`);
    
    // Count programs (approximate - they're split across multiple INSERT statements)
    const programSections = content.match(/INSERT INTO programs[\s\S]*?ON CONFLICT/g) || [];
    let totalPrograms = 0;
    for (const section of programSections) {
      totalPrograms += (section.match(/^\(\d+,/gm) || []).length;
    }
    console.log(`  Programs: ${totalPrograms} entries`);
    
    // Validate JSON structure
    console.log('\n🔍 Validating JSON fields...');
    const jsonFields = content.match(/'\{[^}]*\}'/g) || [];
    let validJson = 0;
    let invalidJson = 0;
    
    jsonFields.forEach(field => {
      try {
        // Remove outer quotes and unescape
        const jsonStr = field.slice(1, -1).replace(/''/g, "'").replace(/\\'/g, "'");
        JSON.parse(jsonStr);
        validJson++;
      } catch {
        invalidJson++;
      }
    });
    
    console.log(`  ✓ Valid JSON fields: ${validJson}`);
    if (invalidJson > 0) {
      console.log(`  ✗ Invalid JSON fields: ${invalidJson}`);
    }
    
    // Check for potential issues
    console.log('\n🔎 Checking for potential issues...\n');
    
    // Check for very long lines (>10000 chars)
    const lines = content.split('\n');
    const longLines = lines.filter(l => l.length > 10000);
    if (longLines.length > 0) {
      console.log(`  ⚠️  ${longLines.length} very long lines found (may cause issues in some editors)`);
    } else {
      console.log(`  ✓ No problematically long lines`);
    }
    
    // Check for proper ON CONFLICT clauses
    const onConflicts = (content.match(/ON CONFLICT/g) || []).length;
    console.log(`  ✓ ${onConflicts} ON CONFLICT clauses (upsert support)`);
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70) + '\n');
    
    console.log('✅ seed-data.sql Structure:');
    console.log(`   • ${userValues} users`);
    console.log(`   • ${universityEntries} universities`);
    console.log(`   • ${formulaEntries} merit formulas`);
    console.log(`   • ${totalPrograms} programs`);
    console.log(`   • ${validJson} valid JSON fields`);
    console.log(`   • ${onConflicts} upsert statements\n`);
    
    if (invalidJson === 0 && longLines.length === 0) {
      console.log('✅ All checks passed! File is ready for production use.\n');
      console.log('📝 To use:');
      console.log('   1. Copy SQL content');
      console.log('   2. Paste in Vercel Postgres Query editor');
      console.log('   3. Execute\n');
      console.log('   OR');
      console.log('   1. Run: node seed-database.js\n');
      return true;
    } else {
      console.log('⚠️  Some issues detected. Review above warnings.\n');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

testSeedData().then(success => {
  process.exit(success ? 0 : 1);
});

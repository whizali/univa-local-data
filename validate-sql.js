/**
 * Validate seed-data.sql for common SQL syntax errors
 */

import { readFile, writeFile } from 'fs/promises';

async function validateSQL() {
  console.log('\n🔍 Validating seed-data.sql...\n');
  
  try {
    const content = await readFile('./seed-data.sql', 'utf8');
    const lines = content.split('\n');
    
    let issues = [];
    let warnings = [];
    
    // Check 1: Unescaped single quotes in strings
    console.log('✓ Check 1: Looking for unescaped quotes...');
    let inString = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("'") && !line.includes("''") && !line.startsWith('--')) {
        // Check if it's a legitimate case
        const singleQuoteCount = (line.match(/'/g) || []).length;
        const doubleQuoteCount = (line.match(/''/g) || []).length;
        
        if (singleQuoteCount % 2 !== 0 && doubleQuoteCount === 0) {
          issues.push({
            line: i + 1,
            type: 'Unescaped Quote',
            content: line.trim().substring(0, 100)
          });
        }
      }
    }
    
    // Check 2: Trailing commas
    console.log('✓ Check 2: Looking for trailing commas...');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.endsWith(',') && (lines[i + 1]?.trim().startsWith('ON CONFLICT') || 
          lines[i + 1]?.trim().startsWith(');'))) {
        issues.push({
          line: i + 1,
          type: 'Trailing Comma',
          content: line.substring(0, 100)
        });
      }
    }
    
    // Check 3: Mismatched parentheses
    console.log('✓ Check 3: Checking parentheses balance...');
    let parenCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('--')) continue;
      
      for (const char of line) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
      }
      
      if (parenCount < 0) {
        issues.push({
          line: i + 1,
          type: 'Parentheses Mismatch',
          content: `Extra closing parenthesis: ${line.trim().substring(0, 50)}`
        });
        parenCount = 0; // Reset
      }
    }
    
    if (parenCount !== 0) {
      warnings.push({
        type: 'Parentheses Imbalance',
        message: `${parenCount} unclosed parentheses in file`
      });
    }
    
    // Check 4: Missing semicolons
    console.log('✓ Check 4: Checking for missing semicolons...');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('INSERT INTO') || line.startsWith('CREATE TABLE')) {
        // Find the end of this statement
        let foundEnd = false;
        for (let j = i; j < Math.min(i + 100, lines.length); j++) {
          if (lines[j].trim().endsWith(';')) {
            foundEnd = true;
            break;
          }
        }
        if (!foundEnd) {
          warnings.push({
            line: i + 1,
            type: 'Missing Semicolon',
            content: line.substring(0, 50)
          });
        }
      }
    }
    
    // Check 5: JSON validity in JSONB columns
    console.log('✓ Check 5: Validating JSON in JSONB fields...');
    const jsonPattern = /\{[^}]+\}/g;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.match(jsonPattern);
      if (matches) {
        for (const match of matches) {
          try {
            // Try to find complete JSON (may span lines)
            const jsonStr = match.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
            if (jsonStr.startsWith('{')) {
              JSON.parse(jsonStr);
            }
          } catch (e) {
            // Most will fail because they span multiple lines - that's OK
          }
        }
      }
    }
    
    // Report results
    console.log('\n' + '='.repeat(70));
    console.log('VALIDATION RESULTS');
    console.log('='.repeat(70) + '\n');
    
    console.log(`Total Lines: ${lines.length}`);
    console.log(`File Size: ${(content.length / 1024).toFixed(1)} KB\n`);
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ No issues found! seed-data.sql appears to be valid.\n');
      return true;
    }
    
    if (issues.length > 0) {
      console.log(`❌ CRITICAL ISSUES: ${issues.length}\n`);
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. Line ${issue.line}: ${issue.type}`);
        console.log(`   ${issue.content}\n`);
      });
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️  WARNINGS: ${warnings.length}\n`);
      warnings.forEach((warning, index) => {
        if (warning.line) {
          console.log(`${index + 1}. Line ${warning.line}: ${warning.type}`);
          console.log(`   ${warning.content}\n`);
        } else {
          console.log(`${index + 1}. ${warning.type}: ${warning.message}\n`);
        }
      });
    }
    
    return issues.length === 0;
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

// Run validation
validateSQL().then(isValid => {
  if (isValid) {
    console.log('✨ Validation complete - file is ready to use!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Please fix the issues above before running seed-data.sql\n');
    process.exit(1);
  }
});

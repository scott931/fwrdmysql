#!/usr/bin/env node

/**
 * useEffect Dependency Fix Script
 *
 * This script helps identify and fix useEffect dependency issues
 * by analyzing the code and suggesting proper dependencies.
 */

const fs = require('fs');
const path = require('path');

// Common useEffect patterns that need attention
const useEffectPatterns = [
  {
    pattern: /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\)/g,
    description: 'Empty dependency array - may need dependencies'
  },
  {
    pattern: /useEffect\(\(\) => \{[\s\S]*?\}, \[([^\]]*)\]\)/g,
    description: 'Missing dependencies in dependency array'
  },
  {
    pattern: /useEffect\(\(\) => \{[\s\S]*?(\w+)\.\w+\(\)[\s\S]*?\}, \[\]\)/g,
    description: 'Function calls without dependencies'
  }
];

// Files to analyze
const filesToAnalyze = [
  'src/pages/UploadCoursePage.tsx',
  'src/pages/SearchPage.tsx',
  'src/pages/ProfilePage.tsx',
  'src/pages/ManageUsersPage.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/CoursesPage.tsx',
  'src/pages/CoursePage.tsx',
  'src/pages/CommunityPage.tsx',
  'src/pages/ChatPage.tsx',
  'src/components/ui/VideoPlayer.tsx',
  'src/components/ui/AdvancedSearch.tsx',
  'src/contexts/AuthContext.tsx',
  'src/contexts/PermissionContext.tsx'
];

console.log('🔍 Analyzing useEffect dependencies...\n');

function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  console.log(`📁 Analyzing: ${filePath}`);

  let issuesFound = 0;

  // Find all useEffect calls
  const useEffectMatches = content.match(/useEffect\(/g);
  if (useEffectMatches) {
    console.log(`  Found ${useEffectMatches.length} useEffect calls`);

    // Analyze each useEffect
    useEffectMatches.forEach((match, index) => {
      const startIndex = content.indexOf(match, index > 0 ? content.indexOf(match, content.indexOf(match) + 1) : 0);
      const endIndex = content.indexOf(')', startIndex);
      const useEffectCall = content.substring(startIndex, endIndex + 1);

      // Check for common issues
      if (useEffectCall.includes('[]')) {
        console.log(`  ⚠️  useEffect #${index + 1}: Empty dependency array detected`);
        console.log(`     Consider adding missing dependencies or use useCallback`);
        issuesFound++;
      }

      // Check for function calls that might need dependencies
      const functionCalls = useEffectCall.match(/\w+\.\w+\(\)/g);
      if (functionCalls) {
        console.log(`  ℹ️  useEffect #${index + 1}: Contains function calls: ${functionCalls.join(', ')}`);
        console.log(`     Ensure these functions are stable or add to dependencies`);
      }
    });
  }

  if (issuesFound === 0) {
    console.log(`  ✅ No obvious dependency issues found`);
  }

  console.log('');
}

// Analyze all files
filesToAnalyze.forEach(analyzeFile);

console.log('📋 Recommendations:');
console.log('');
console.log('1. For empty dependency arrays:');
console.log('   - Add missing dependencies if the effect uses variables from component scope');
console.log('   - Use useCallback for functions that are passed as dependencies');
console.log('   - Use useMemo for expensive calculations');
console.log('');
console.log('2. For function calls in useEffect:');
console.log('   - Move functions outside useEffect if they don\'t depend on props/state');
console.log('   - Use useCallback to memoize functions that are used as dependencies');
console.log('   - Consider if the function call is necessary on every render');
console.log('');
console.log('3. Common patterns to fix:');
console.log('   - API calls: Add loading state and error handling');
console.log('   - Event listeners: Clean up in return function');
console.log('   - Timers: Clear in cleanup function');
console.log('   - Subscriptions: Unsubscribe in cleanup function');
console.log('');
console.log('4. ESLint rules to enable:');
console.log('   - react-hooks/exhaustive-deps: Warns about missing dependencies');
console.log('   - react-hooks/rules-of-hooks: Ensures hooks are called correctly');
console.log('');

console.log('✅ Analysis complete! Review the issues above and fix them systematically.');
#!/usr/bin/env node

/**
 * Quick Verification Script
 * Checks configuration and code structure without requiring servers to be running
 */

const fs = require('fs');
const path = require('path');

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

const log = (message, type = 'info') => {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} ${message}`);
};

const checkFile = (filePath, description, checkFunction) => {
  results.total++;

  try {
    if (!fs.existsSync(filePath)) {
      log(`${description} - File not found: ${filePath}`, 'error');
      results.failed++;
      return false;
    }

    const result = checkFunction(filePath);
    if (result) {
      log(`${description} - ✅ Passed`, 'success');
      results.passed++;
      return true;
    } else {
      log(`${description} - ❌ Failed`, 'error');
      results.failed++;
      return false;
    }
  } catch (error) {
    log(`${description} - ❌ Error: ${error.message}`, 'error');
    results.failed++;
    return false;
  }
};

const checkESLintConfig = () => {
  log('\n🔧 Checking ESLint Configuration', 'info');

  checkFile('eslint.config.js', 'ESLint config exists', (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes('require(') && content.includes('module.exports');
  });

  checkFile('.eslintrc.json', 'No conflicting ESLint config', (filePath) => {
    return false; // This file should NOT exist
  });
};

const checkPackageJson = () => {
  log('\n📦 Checking Package Configuration', 'info');

  checkFile('package.json', 'Package.json exists', (filePath) => {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return content.name && content.version && content.scripts;
  });

  checkFile('package.json', 'Required dependencies present', (filePath) => {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const required = ['next', 'react', 'react-dom', 'typescript'];
    return required.every(dep => content.dependencies[dep] || content.devDependencies[dep]);
  });

  checkFile('package.json', 'ESLint dependencies present', (filePath) => {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const required = ['eslint', '@eslint/js', 'typescript-eslint'];
    return required.every(dep => content.dependencies[dep] || content.devDependencies[dep]);
  });
};

const checkEnvironmentFiles = () => {
  log('\n⚙️  Checking Environment Configuration', 'info');

  const envFiles = [
    '.env.local',
    '.env',
    'frontend.env.example'
  ];

  envFiles.forEach(file => {
    checkFile(file, `${file} exists`, (filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes('API_BASE_URL') || content.includes('localhost:3002');
    });
  });
};

const checkApiServiceFiles = () => {
  log('\n🔧 Checking API Service Files', 'info');

  const apiFiles = [
    'src/lib/api.ts',
    'src/lib/mysql.ts'
  ];

  apiFiles.forEach(file => {
    checkFile(file, `${file} exists`, (filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes('API_BASE_URL') || content.includes('fetch(');
    });
  });
};

const checkComponentStructure = () => {
  log('\n🎨 Checking Component Structure', 'info');

  const requiredDirs = [
    'src/components',
    'src/pages',
    'src/lib',
    'src/types'
  ];

  requiredDirs.forEach(dir => {
    checkFile(dir, `Directory exists: ${dir}`, (dirPath) => {
      return fs.statSync(dirPath).isDirectory();
    });
  });
};

const checkBackendFiles = () => {
  log('\n🔧 Checking Backend Files', 'info');

  const backendFiles = [
    'backend/server.js',
    'backend/middleware/apiResponse.js',
    'backend/routes/secureRoutes.js'
  ];

  backendFiles.forEach(file => {
    checkFile(file, `${file} exists`, (filePath) => {
      return true; // Just check if file exists
    });
  });
};

const checkTestScripts = () => {
  log('\n🧪 Checking Test Scripts', 'info');

  const testScripts = [
    'test-real-api-integration.js',
    'verify-components.js',
    'run-all-tests.js'
  ];

  testScripts.forEach(script => {
    checkFile(script, `${script} exists`, (filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes('#!/usr/bin/env node');
    });
  });
};

const generateReport = () => {
  log('\n📊 Quick Verification Summary', 'info');
  log(`Total Checks: ${results.total}`, 'info');
  log(`✅ Passed: ${results.passed}`, 'success');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 'info');

  if (results.failed === 0) {
    log('\n🎉 All configuration checks passed!', 'success');
    log('✅ ESLint configuration is properly set up', 'success');
    log('✅ Package.json is correctly configured', 'success');
    log('✅ Environment files are present', 'success');
    log('✅ API service files exist', 'success');
    log('✅ Component structure is correct', 'success');
    log('✅ Backend files are present', 'success');
    log('✅ Test scripts are available', 'success');

    log('\n🚀 Next Steps:', 'info');
    log('1. Start the backend server: cd backend && npm start', 'info');
    log('2. Start the frontend server: npm run dev', 'info');
    log('3. Run the full test suite: node run-all-tests.js', 'info');
    log('4. Test the application manually in the browser', 'info');

  } else {
    log('\n⚠️  Some checks failed. Please review the errors above.', 'error');
    log('Fix the issues before proceeding with testing.', 'error');
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      successRate: ((results.passed / results.total) * 100).toFixed(1)
    },
    details: results.details
  };

  fs.writeFileSync('quick-verification-report.json', JSON.stringify(report, null, 2));
  log('📄 Report saved to quick-verification-report.json', 'info');
};

const runQuickVerification = () => {
  log('🚀 Starting Quick Configuration Verification', 'info');
  log('This checks configuration and file structure without requiring servers to run', 'info');

  try {
    checkESLintConfig();
    checkPackageJson();
    checkEnvironmentFiles();
    checkApiServiceFiles();
    checkComponentStructure();
    checkBackendFiles();
    checkTestScripts();

    generateReport();

  } catch (error) {
    log(`❌ Verification failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Run verification if this file is executed directly
if (require.main === module) {
  runQuickVerification();
}

module.exports = {
  runQuickVerification,
  checkESLintConfig,
  checkPackageJson,
  checkEnvironmentFiles,
  checkApiServiceFiles
};
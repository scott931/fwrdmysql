#!/usr/bin/env node

/**
 * Master Test Runner
 * Runs all verification and testing scripts to ensure the application is production-ready
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test results
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const runScript = (scriptName, scriptPath) => {
  return new Promise((resolve, reject) => {
    log(`🚀 Running ${scriptName}...`, 'info');

    const child = spawn('node', [scriptPath], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code === 0) {
        testResults.passed++;
        log(`✅ ${scriptName} completed successfully`, 'success');
        resolve({ success: true, output, errorOutput });
      } else {
        testResults.failed++;
        log(`❌ ${scriptName} failed with code ${code}`, 'error');
        resolve({ success: false, output, errorOutput, code });
      }
      testResults.total++;
    });

    child.on('error', (error) => {
      testResults.failed++;
      log(`❌ ${scriptName} failed to start: ${error.message}`, 'error');
      testResults.total++;
      resolve({ success: false, error: error.message });
    });
  });
};

const checkServersRunning = async () => {
  log('🔍 Checking if servers are running...', 'info');

  const fetch = require('node-fetch');

  const servers = [
    { name: 'Backend API', url: 'http://localhost:3002/api/health' },
    { name: 'Frontend', url: 'http://localhost:3000' }
  ];

  for (const server of servers) {
    try {
      const response = await fetch(server.url, { timeout: 5000 });
      if (response.ok) {
        log(`✅ ${server.name} is running`, 'success');
        testResults.passed++;
      } else {
        log(`❌ ${server.name} is not responding properly (Status: ${response.status})`, 'error');
        testResults.failed++;
      }
    } catch (error) {
      log(`❌ ${server.name} is not running: ${error.message}`, 'error');
      testResults.failed++;
    }
    testResults.total++;
  }
};

const checkESLintConfiguration = () => {
  log('🔧 Checking ESLint configuration...', 'info');

  try {
    // Check if eslint.config.js exists and is CommonJS
    if (fs.existsSync('eslint.config.js')) {
      const content = fs.readFileSync('eslint.config.js', 'utf8');

      if (content.includes('require(') && content.includes('module.exports')) {
        log('✅ ESLint configuration is in CommonJS format', 'success');
        testResults.passed++;
      } else {
        log('❌ ESLint configuration is not in CommonJS format', 'error');
        testResults.failed++;
      }
    } else {
      log('❌ eslint.config.js not found', 'error');
      testResults.failed++;
    }

    // Check if .eslintrc.json exists (should not exist)
    if (fs.existsSync('.eslintrc.json')) {
      log('❌ .eslintrc.json still exists (should be removed)', 'error');
      testResults.failed++;
    } else {
      log('✅ .eslintrc.json properly removed', 'success');
      testResults.passed++;
    }

    testResults.total += 2;
  } catch (error) {
    log(`❌ Error checking ESLint configuration: ${error.message}`, 'error');
    testResults.failed++;
    testResults.total++;
  }
};

const checkPackageJson = () => {
  log('📦 Checking package.json configuration...', 'info');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Check for required dependencies
    const requiredDeps = ['next', 'react', 'react-dom', 'typescript'];
    const requiredDevDeps = ['eslint', '@types/node', '@types/react'];

    let allDepsPresent = true;

    requiredDeps.forEach(dep => {
      if (!packageJson.dependencies[dep]) {
        log(`❌ Missing dependency: ${dep}`, 'error');
        allDepsPresent = false;
        testResults.failed++;
      }
    });

    requiredDevDeps.forEach(dep => {
      if (!packageJson.devDependencies[dep]) {
        log(`❌ Missing dev dependency: ${dep}`, 'error');
        allDepsPresent = false;
        testResults.failed++;
      }
    });

    if (allDepsPresent) {
      log('✅ All required dependencies are present', 'success');
      testResults.passed++;
    }

    testResults.total++;
  } catch (error) {
    log(`❌ Error checking package.json: ${error.message}`, 'error');
    testResults.failed++;
    testResults.total++;
  }
};

const checkEnvironmentFiles = () => {
  log('⚙️  Checking environment configuration...', 'info');

  const envFiles = [
    '.env.local',
    '.env',
    'frontend.env.example'
  ];

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');

      if (content.includes('API_BASE_URL') || content.includes('localhost:3002')) {
        log(`✅ ${file} contains API configuration`, 'success');
        testResults.passed++;
      } else {
        log(`❌ ${file} missing API configuration`, 'error');
        testResults.failed++;
      }
    } else {
      log(`⚠️  ${file} not found`, 'error');
      testResults.failed++;
    }
    testResults.total++;
  });
};

const runAllTests = async () => {
  log('🚀 Starting Comprehensive Application Test Suite', 'info');
  log('This will verify that the application is ready for production use', 'info');

  try {
    // 1. Check basic configuration
    log('\n📋 Step 1: Checking Basic Configuration', 'info');
    checkESLintConfiguration();
    checkPackageJson();
    checkEnvironmentFiles();

    // 2. Check if servers are running
    log('\n🌐 Step 2: Checking Server Status', 'info');
    await checkServersRunning();

    // 3. Run API integration tests
    log('\n🔗 Step 3: Running API Integration Tests', 'info');
    const apiTestResult = await runScript('API Integration Tests', 'test-real-api-integration.js');
    testResults.details.push({
      test: 'API Integration Tests',
      success: apiTestResult.success,
      output: apiTestResult.output
    });

    // 4. Run component verification
    log('\n🎨 Step 4: Running Component Verification', 'info');
    const componentTestResult = await runScript('Component Verification', 'verify-components.js');
    testResults.details.push({
      test: 'Component Verification',
      success: componentTestResult.success,
      output: componentTestResult.output
    });

    // 5. Run ESLint
    log('\n🔍 Step 5: Running ESLint', 'info');
    const eslintResult = await runScript('ESLint', 'npm run lint');
    testResults.details.push({
      test: 'ESLint',
      success: eslintResult.success,
      output: eslintResult.output
    });

    // Generate final report
    generateFinalReport();

  } catch (error) {
    log(`❌ Test suite failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

const generateFinalReport = () => {
  log('\n📊 Final Test Results Summary', 'info');
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`✅ Passed: ${testResults.passed}`, 'success');
  log(`❌ Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'info');

  if (testResults.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! 🎉', 'success');
    log('✅ ESLint configuration is properly set up', 'success');
    log('✅ API endpoints are working correctly', 'success');
    log('✅ Frontend components are using real data', 'success');
    log('✅ Authentication system is functional', 'success');
    log('✅ Environment configuration is complete', 'success');
    log('✅ The application is ready for production use!', 'success');

    log('\n🚀 Next Steps:', 'info');
    log('1. Deploy to your production environment', 'info');
    log('2. Set up production database', 'info');
    log('3. Configure production environment variables', 'info');
    log('4. Set up monitoring and logging', 'info');
    log('5. Configure SSL certificates', 'info');

  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'error');
    log('The application needs fixes before it can be considered production-ready.', 'error');
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.total) * 100).toFixed(1)
    },
    details: testResults.details,
    recommendations: testResults.failed === 0 ? [
      'Application is ready for production deployment',
      'All API endpoints are working correctly',
      'Frontend components are using real data',
      'Authentication system is functional',
      'ESLint configuration is properly set up'
    ] : [
      'Fix failed tests before production deployment',
      'Review error messages above for specific issues',
      'Ensure all servers are running before testing',
      'Check environment configuration',
      'Verify API endpoints are accessible'
    ]
  };

  fs.writeFileSync('comprehensive-test-report.json', JSON.stringify(report, null, 2));
  log('📄 Detailed report saved to comprehensive-test-report.json', 'info');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  checkServersRunning,
  checkESLintConfiguration,
  checkPackageJson,
  checkEnvironmentFiles
};
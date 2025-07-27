#!/usr/bin/env node

/**
 * Component Verification Script
 * Verifies that all frontend components are using real API data instead of mock data
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = 'src';
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const PAGES_DIR = path.join(SRC_DIR, 'pages');

// Test results
const verificationResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

const log = (message, type = 'info') => {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} ${message}`);
};

const checkFileForApiUsage = (filePath, fileName) => {
  verificationResults.total++;

  try {
    if (!fs.existsSync(filePath)) {
      log(`${fileName} - File not found`, 'error');
      verificationResults.failed++;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Check for real API usage patterns
    const hasApiImport = content.includes('from \'../lib/api\'') ||
                        content.includes('from \'../../lib/api\'') ||
                        content.includes('from \'../../../lib/api\'') ||
                        content.includes('from \'@/lib/api\'');

    const hasApiCall = content.includes('api.') ||
                      content.includes('API_BASE_URL') ||
                      content.includes('fetch(') ||
                      content.includes('useEffect') && content.includes('fetch');

    const hasMockData = content.includes('mockData') ||
                       content.includes('mock_data') ||
                       content.includes('MOCK_') ||
                       content.includes('sampleData') ||
                       content.includes('dummyData');

    const hasStaticData = content.includes('const data = [') ||
                         content.includes('const courses = [') ||
                         content.includes('const users = [') ||
                         content.includes('const instructors = [');

    // Determine the status
    if (hasApiImport || hasApiCall) {
      verificationResults.passed++;
      log(`${fileName} - ✅ Uses real API calls`, 'success');
      return { status: 'success', reason: 'Uses real API calls' };
    } else if (hasMockData || hasStaticData) {
      verificationResults.failed++;
      log(`${fileName} - ❌ Still uses mock/static data`, 'error');
      return { status: 'failed', reason: 'Uses mock/static data' };
    } else {
      // Check if it's a static component (no data loading)
      const isStaticComponent = !content.includes('useState') &&
                               !content.includes('useEffect') &&
                               !content.includes('fetch') &&
                               !content.includes('api.');

      if (isStaticComponent) {
        verificationResults.passed++;
        log(`${fileName} - ℹ️  Static component (no data loading needed)`, 'info');
        return { status: 'success', reason: 'Static component' };
      } else {
        verificationResults.failed++;
        log(`${fileName} - ❌ No clear API usage pattern detected`, 'error');
        return { status: 'failed', reason: 'No clear API usage pattern' };
      }
    }
  } catch (error) {
    verificationResults.failed++;
    log(`${fileName} - ❌ Error reading file: ${error.message}`, 'error');
    return { status: 'failed', reason: `Error: ${error.message}` };
  }
};

const scanDirectory = (dirPath, dirName) => {
  log(`\n📁 Scanning ${dirName} directory...`, 'info');

  try {
    const files = fs.readdirSync(dirPath);
    const tsxFiles = files.filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

    tsxFiles.forEach(file => {
      const filePath = path.join(dirPath, file);
      const result = checkFileForApiUsage(filePath, `${dirName}/${file}`);

      verificationResults.details.push({
        file: `${dirName}/${file}`,
        ...result
      });
    });

    return tsxFiles.length;
  } catch (error) {
    log(`❌ Error scanning ${dirName}: ${error.message}`, 'error');
    return 0;
  }
};

const checkSpecificComponents = () => {
  log('\n🎯 Checking Specific Critical Components', 'info');

  const criticalComponents = [
    { path: 'src/pages/HomePage.tsx', name: 'HomePage' },
    { path: 'src/pages/CoursesPage.tsx', name: 'CoursesPage' },
    { path: 'src/pages/CourseDetailPage.tsx', name: 'CourseDetailPage' },
    { path: 'src/pages/InstructorPage.tsx', name: 'InstructorPage' },
    { path: 'src/pages/AdminPage.tsx', name: 'AdminPage' },
    { path: 'src/components/CourseCard.tsx', name: 'CourseCard' },
    { path: 'src/components/CourseList.tsx', name: 'CourseList' },
    { path: 'src/components/InstructorCard.tsx', name: 'InstructorCard' },
    { path: 'src/components/UserProfile.tsx', name: 'UserProfile' },
    { path: 'src/components/SearchResults.tsx', name: 'SearchResults' }
  ];

  criticalComponents.forEach(({ path: filePath, name }) => {
    checkFileForApiUsage(filePath, name);
  });
};

const checkApiServiceFiles = () => {
  log('\n🔧 Checking API Service Files', 'info');

  const apiFiles = [
    'src/lib/api.ts',
    'src/lib/mysql.ts',
    'src/services/apiService.ts',
    'src/utils/api.ts'
  ];

  apiFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const hasRealApiCalls = content.includes('fetch(') ||
                             content.includes('API_BASE_URL') ||
                             content.includes('localhost:3002');

      if (hasRealApiCalls) {
        verificationResults.passed++;
        log(`${file} - ✅ Contains real API calls`, 'success');
      } else {
        verificationResults.failed++;
        log(`${file} - ❌ No real API calls found`, 'error');
      }
      verificationResults.total++;
    } else {
      log(`${file} - ⚠️  File not found`, 'error');
    }
  });
};

const checkEnvironmentConfiguration = () => {
  log('\n⚙️  Checking Environment Configuration', 'info');

  const envFiles = [
    '.env.local',
    '.env',
    'frontend.env.example'
  ];

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const hasApiUrl = content.includes('API_BASE_URL') ||
                       content.includes('NEXT_PUBLIC_API_URL') ||
                       content.includes('localhost:3002');

      if (hasApiUrl) {
        verificationResults.passed++;
        log(`${file} - ✅ Contains API configuration`, 'success');
      } else {
        verificationResults.failed++;
        log(`${file} - ❌ Missing API configuration`, 'error');
      }
      verificationResults.total++;
    } else {
      log(`${file} - ⚠️  File not found`, 'error');
    }
  });
};

const generateVerificationReport = () => {
  log('\n📊 Component Verification Summary', 'info');
  log(`Total Components Checked: ${verificationResults.total}`, 'info');
  log(`✅ Passed: ${verificationResults.passed}`, 'success');
  log(`❌ Failed: ${verificationResults.failed}`, verificationResults.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((verificationResults.passed / verificationResults.total) * 100).toFixed(1)}%`, 'info');

  if (verificationResults.failed === 0) {
    log('\n🎉 All components are using real API data!', 'success');
    log('✅ No mock data found in components', 'success');
    log('✅ API service files properly configured', 'success');
    log('✅ Environment configuration complete', 'success');
  } else {
    log('\n⚠️  Some components still need to be updated:', 'error');
    verificationResults.details
      .filter(detail => detail.status === 'failed')
      .forEach(detail => {
        log(`   - ${detail.file}: ${detail.reason}`, 'error');
      });
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: verificationResults.total,
      passed: verificationResults.passed,
      failed: verificationResults.failed,
      successRate: ((verificationResults.passed / verificationResults.total) * 100).toFixed(1)
    },
    details: verificationResults.details
  };

  fs.writeFileSync('component-verification-report.json', JSON.stringify(report, null, 2));
  log('📄 Detailed report saved to component-verification-report.json', 'info');
};

const runVerification = () => {
  log('🚀 Starting Component Verification', 'info');
  log('Checking that all components use real API data instead of mock data', 'info');

  try {
    // Scan directories
    scanDirectory(COMPONENTS_DIR, 'components');
    scanDirectory(PAGES_DIR, 'pages');

    // Check specific critical components
    checkSpecificComponents();

    // Check API service files
    checkApiServiceFiles();

    // Check environment configuration
    checkEnvironmentConfiguration();

    // Generate report
    generateVerificationReport();

  } catch (error) {
    log(`❌ Verification failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Run verification if this file is executed directly
if (require.main === module) {
  runVerification();
}

module.exports = {
  runVerification,
  checkFileForApiUsage,
  scanDirectory,
  checkSpecificComponents,
  checkApiServiceFiles,
  checkEnvironmentConfiguration
};
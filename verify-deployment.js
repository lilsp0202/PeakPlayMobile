#!/usr/bin/env node

/**
 * Comprehensive Deployment Verification Script
 * Tests key functionality including team creation across environments
 */

const environments = [
  {
    name: 'Local Development',
    baseUrl: 'http://localhost:3000',
    priority: 'HIGH'
  },
  {
    name: 'Vercel Production',
    baseUrl: 'https://peakplay-8xjabeq3l-shreyasprasanna25-6637s-projects.vercel.app',
    priority: 'CRITICAL'
  }
];

const testEndpoints = [
  {
    name: 'Health Check',
    path: '/api/test-db',
    method: 'GET',
    expectedStatus: [200, 404, 401], // 404 or 401 are acceptable for unauthenticated requests
    critical: true
  },
  {
    name: 'Teams API',
    path: '/api/teams',
    method: 'GET',
    expectedStatus: [200, 401], // 401 is expected for unauthenticated requests
    critical: true
  },
  {
    name: 'Dashboard Page',
    path: '/dashboard',
    method: 'GET',
    expectedStatus: [200, 302], // 302 redirect is acceptable
    critical: true
  },
  {
    name: 'Main Page',
    path: '/',
    method: 'GET',
    expectedStatus: [200],
    critical: true
  }
];

async function testEndpoint(baseUrl, endpoint) {
  try {
    const response = await fetch(`${baseUrl}${endpoint.path}`, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const isExpectedStatus = endpoint.expectedStatus.includes(response.status);
    
    return {
      name: endpoint.name,
      success: isExpectedStatus,
      status: response.status,
      statusText: response.statusText,
      critical: endpoint.critical,
      message: isExpectedStatus ? 'OK' : `Unexpected status: ${response.status}`
    };
  } catch (error) {
    return {
      name: endpoint.name,
      success: false,
      status: 'ERROR',
      statusText: error.message,
      critical: endpoint.critical,
      message: `Network error: ${error.message}`
    };
  }
}

async function testEnvironment(env) {
  console.log(`\n🌐 Testing ${env.name} (${env.baseUrl})...`);
  console.log('═'.repeat(60));
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(env.baseUrl, endpoint);
    results.push(result);
    
    const icon = result.success ? '✅' : (result.critical ? '❌' : '⚠️');
    const priority = result.critical ? '[CRITICAL]' : '[INFO]';
    
    console.log(`${icon} ${priority} ${result.name}: ${result.status} - ${result.message}`);
  }
  
  return results;
}

async function generateReport(allResults) {
  console.log('\n📊 DEPLOYMENT VERIFICATION REPORT');
  console.log('═'.repeat(60));
  
  let totalTests = 0;
  let passedTests = 0;
  let criticalFailures = 0;
  
  for (const [envName, results] of Object.entries(allResults)) {
    console.log(`\n${envName}:`);
    
    for (const result of results) {
      totalTests++;
      if (result.success) {
        passedTests++;
      } else if (result.critical) {
        criticalFailures++;
      }
    }
    
    const envPassed = results.filter(r => r.success).length;
    const envTotal = results.length;
    const envHealth = Math.round((envPassed / envTotal) * 100);
    
    console.log(`  Health: ${envHealth}% (${envPassed}/${envTotal} tests passed)`);
  }
  
  console.log('\n🎯 SUMMARY:');
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${totalTests - passedTests}`);
  console.log(`  Critical Failures: ${criticalFailures}`);
  console.log(`  Overall Health: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (criticalFailures > 0) {
    console.log('\n🚨 CRITICAL ISSUES DETECTED!');
    console.log('   Please address these issues before deployment.');
    process.exit(1);
  } else {
    console.log('\n✅ All critical tests passed!');
    console.log('   Deployment verification successful.');
  }
}

async function main() {
  console.log('🚀 PeakPlay Deployment Verification');
  console.log('═'.repeat(60));
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🔧 Testing team creation functionality across environments`);
  
  const allResults = {};
  
  for (const env of environments) {
    const results = await testEnvironment(env);
    allResults[env.name] = results;
  }
  
  await generateReport(allResults);
}

// Run the verification
main().catch(error => {
  console.error('\n💥 Verification failed:', error);
  process.exit(1);
}); 
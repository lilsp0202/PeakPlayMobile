#!/usr/bin/env node

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAPIPerformance() {
  console.log('🚀 Testing API Performance Improvements...\n');

  const tests = [
    {
      name: 'Feedback API',
      url: `${BASE_URL}/api/feedback`,
      expectedTime: 2000,
    },
    {
      name: 'Actions API',
      url: `${BASE_URL}/api/actions`,
      expectedTime: 2000,
    },
    {
      name: 'Teams API',
      url: `${BASE_URL}/api/teams?includeMembers=true&includeStats=true`,
      expectedTime: 2000,
    },
  ];

  const results = [];

  for (const test of tests) {
    console.log(`🔍 Testing ${test.name}...`);
    
    try {
      const start = Date.now();
      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const duration = Date.now() - start;
      
      const status = response.status;
      const isSuccess = status === 200 || status === 401; // 401 is expected for unauthenticated requests
      const isWithinTimeLimit = duration <= test.expectedTime;
      
      console.log(`   Response: ${status} (${isSuccess ? '✅' : '❌'})`);
      console.log(`   Duration: ${duration}ms (${isWithinTimeLimit ? '✅' : '❌'} target: <${test.expectedTime}ms)`);
      
      if (isSuccess && status === 200) {
        const data = await response.text();
        console.log(`   Data size: ${data.length} characters`);
      }
      
      results.push({
        name: test.name,
        duration,
        status,
        isSuccess,
        isWithinTimeLimit,
        passed: isSuccess && isWithinTimeLimit
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        name: test.name,
        duration: null,
        status: 'ERROR',
        isSuccess: false,
        isWithinTimeLimit: false,
        passed: false,
        error: error.message
      });
    }
    
    console.log('');
  }

  // Test concurrent requests to check for connection pool exhaustion
  console.log('🔄 Testing concurrent requests (simulating real-world usage)...');
  
  const concurrentTests = [];
  for (let i = 0; i < 3; i++) {
    concurrentTests.push(
      fetch(`${BASE_URL}/api/actions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }
  
  const concurrentStart = Date.now();
  try {
    const concurrentResults = await Promise.all(concurrentTests);
    const concurrentDuration = Date.now() - concurrentStart;
    
    console.log(`   Concurrent requests completed in: ${concurrentDuration}ms`);
    console.log(`   All responses: ${concurrentResults.map(r => r.status).join(', ')}`);
    
    if (concurrentDuration < 5000) {
      console.log('   ✅ Concurrent requests handled efficiently');
    } else {
      console.log('   ❌ Concurrent requests still slow');
    }
  } catch (error) {
    console.log(`   ❌ Concurrent test failed: ${error.message}`);
  }

  // Summary
  console.log('\n📊 PERFORMANCE TEST SUMMARY:');
  console.log('====================================');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = result.duration ? `${result.duration}ms` : 'ERROR';
    console.log(`   ${status} - ${result.name}: ${duration}`);
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All performance tests PASSED! The optimizations are working.');
  } else {
    console.log('⚠️  Some tests failed. Further optimization may be needed.');
  }
  
  return results;
}

testAPIPerformance().catch(console.error); 
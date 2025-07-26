#!/usr/bin/env node

/**
 * Deployment Health Monitoring Script
 * Monitors deployment status and provides actionable feedback
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  vercelUrl: 'https://peakplay-8xjabeq3l-shreyasprasanna25-6637s-projects.vercel.app',
  localUrl: 'http://localhost:3000',
  timeout: 10000,
  retries: 3,
  healthCheckInterval: 30000, // 30 seconds
  logFile: path.join(__dirname, '../deployment-health.log')
};

class DeploymentHealthChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      local: {},
      vercel: {},
      issues: [],
      recommendations: []
    };
  }

  async checkEndpoint(url, endpoint, expectedStatus = [200, 401, 404]) {
    const fullUrl = `${url}${endpoint}`;
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const request = https.get(fullUrl, {
        timeout: CONFIG.timeout,
        headers: {
          'User-Agent': 'PeakPlay-Health-Checker/1.0'
        }
      }, (response) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        
        response.on('end', () => {
          const isHealthy = expectedStatus.includes(response.statusCode);
          
          resolve({
            url: fullUrl,
            status: response.statusCode,
            responseTime,
            healthy: isHealthy,
            bodySize: body.length,
            headers: response.headers,
            error: null
          });
        });
      });
      
      request.on('error', (error) => {
        resolve({
          url: fullUrl,
          status: 'ERROR',
          responseTime: Date.now() - startTime,
          healthy: false,
          error: error.message
        });
      });
      
      request.on('timeout', () => {
        request.destroy();
        resolve({
          url: fullUrl,
          status: 'TIMEOUT',
          responseTime: CONFIG.timeout,
          healthy: false,
          error: 'Request timeout'
        });
      });
    });
  }

  async checkEnvironment(baseUrl, envName) {
    console.log(`\n🔍 Checking ${envName} (${baseUrl})...`);
    
    const endpoints = [
      { path: '/', name: 'Homepage', critical: true },
      { path: '/api/test-db', name: 'Database Health', critical: true },
      { path: '/api/teams', name: 'Teams API', critical: true },
      { path: '/dashboard', name: 'Dashboard', critical: true },
      { path: '/api/auth/signin', name: 'Auth Endpoint', critical: false }
    ];
    
    const results = {};
    
    for (const endpoint of endpoints) {
      const result = await this.checkEndpoint(baseUrl, endpoint.path);
      results[endpoint.name] = {
        ...result,
        critical: endpoint.critical
      };
      
      const icon = result.healthy ? '✅' : (endpoint.critical ? '❌' : '⚠️');
      const status = result.status === 'ERROR' ? result.error : result.status;
      const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
      
      console.log(`${icon} ${endpoint.name}: ${status} (${time})`);
      
      if (!result.healthy && endpoint.critical) {
        this.results.issues.push({
          environment: envName,
          endpoint: endpoint.name,
          issue: `${endpoint.name} is unhealthy`,
          status: result.status,
          error: result.error,
          recommendation: this.getRecommendation(endpoint.name, result)
        });
      }
    }
    
    return results;
  }

  getRecommendation(endpointName, result) {
    const recommendations = {
      'Teams API': 'Check if team creation functionality is working. Verify database connectivity and API route handlers.',
      'Database Health': 'Verify database connection and Prisma configuration. Check environment variables.',
      'Dashboard': 'Check for compilation errors and ensure all components are properly loaded.',
      'Homepage': 'Verify basic application functionality and routing.',
      'Auth Endpoint': 'Check NextAuth configuration and session handling.'
    };
    
    let baseRecommendation = recommendations[endpointName] || 'Check endpoint functionality and dependencies.';
    
    if (result.status === 'TIMEOUT') {
      baseRecommendation += ' Request timed out - check for performance issues or infinite loops.';
    } else if (result.status === 'ERROR') {
      baseRecommendation += ` Network error: ${result.error}`;
    } else if (result.status >= 500) {
      baseRecommendation += ' Server error - check logs for detailed error information.';
    }
    
    return baseRecommendation;
  }

  async generateReport() {
    console.log('\n📊 DEPLOYMENT HEALTH REPORT');
    console.log('═'.repeat(60));
    console.log(`📅 Generated: ${this.results.timestamp}`);
    
    // Calculate overall health
    const allResults = { ...this.results.local, ...this.results.vercel };
    const totalEndpoints = Object.keys(allResults).length;
    const healthyEndpoints = Object.values(allResults).filter(r => r.healthy).length;
    const healthPercentage = Math.round((healthyEndpoints / totalEndpoints) * 100);
    
    console.log(`🎯 Overall Health: ${healthPercentage}% (${healthyEndpoints}/${totalEndpoints} endpoints healthy)`);
    
    // Critical issues
    const criticalIssues = this.results.issues.filter(i => 
      Object.values(allResults).find(r => r.critical && !r.healthy)
    );
    
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.environment} - ${issue.issue}`);
        console.log(`   Status: ${issue.status}`);
        console.log(`   Fix: ${issue.recommendation}`);
      });
    }
    
    // Performance metrics
    const responseTimes = Object.values(allResults)
      .filter(r => r.responseTime && r.healthy)
      .map(r => r.responseTime);
    
    if (responseTimes.length > 0) {
      const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
      const maxResponseTime = Math.max(...responseTimes);
      
      console.log(`\n⚡ Performance:`);
      console.log(`   Average Response Time: ${avgResponseTime}ms`);
      console.log(`   Max Response Time: ${maxResponseTime}ms`);
      
      if (maxResponseTime > 5000) {
        console.log(`   ⚠️ Some endpoints are slow (>${maxResponseTime}ms)`);
      }
    }
    
    // Recommendations
    if (this.results.issues.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.results.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.recommendation}`);
      });
    } else {
      console.log('\n✅ All systems operational!');
    }
    
    // Save results to log file
    this.saveToLog();
  }

  saveToLog() {
    const logEntry = {
      timestamp: this.results.timestamp,
      summary: {
        totalIssues: this.results.issues.length,
        environments: {
          local: this.results.local,
          vercel: this.results.vercel
        }
      },
      issues: this.results.issues
    };
    
    try {
      const logData = JSON.stringify(logEntry, null, 2) + '\n';
      fs.appendFileSync(CONFIG.logFile, logData);
      console.log(`\n📝 Results saved to: ${CONFIG.logFile}`);
    } catch (error) {
      console.error('Failed to save log:', error.message);
    }
  }

  async run() {
    console.log('🚀 PeakPlay Deployment Health Check');
    console.log('═'.repeat(60));
    
    try {
      // Check local environment (if available)
      try {
        this.results.local = await this.checkEnvironment(CONFIG.localUrl, 'Local Development');
      } catch (error) {
        console.log('⚠️ Local environment not available');
      }
      
      // Check Vercel environment
      this.results.vercel = await this.checkEnvironment(CONFIG.vercelUrl, 'Vercel Production');
      
      // Generate report
      await this.generateReport();
      
      // Exit with appropriate code
      const criticalIssues = this.results.issues.filter(i => i.critical);
      if (criticalIssues.length > 0) {
        console.log('\n❌ Health check failed - critical issues detected');
        process.exit(1);
      } else {
        console.log('\n✅ Health check passed - all systems operational');
        process.exit(0);
      }
      
    } catch (error) {
      console.error('\n💥 Health check failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the health checker
const checker = new DeploymentHealthChecker();
checker.run(); 
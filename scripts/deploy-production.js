#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting T&N Fashion Production Deployment Process...\n');

// Check if we're ready for production
function checkProductionReadiness() {
  console.log('📋 Checking production readiness...');
  
  // Check for required environment variables
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.log('Please set these in your Vercel dashboard under Environment Variables.');
    process.exit(1);
  }
  
  // Check if Stripe keys are still test keys
  if (process.env.STRIPE_PUBLISHABLE_KEY?.includes('pk_test_')) {
    console.warn('⚠️  Warning: You\'re still using Stripe test keys. Update to production keys for live payments.');
  }
  
  console.log('✅ Environment variables check passed\n');
}

// Run build to check for errors
function runBuild() {
  console.log('🔨 Running production build...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully\n');
  } catch (error) {
    console.error('❌ Build failed. Please fix the errors before deploying.');
    process.exit(1);
  }
}

// Run linting
function runLint() {
  console.log('🔍 Running ESLint...');
  
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Linting passed\n');
  } catch (error) {
    console.warn('⚠️  Linting issues found. Consider fixing them for better code quality.\n');
  }
}

// Check for common security issues
function securityCheck() {
  console.log('🔒 Running security checks...');
  
  // Check if secrets are exposed in client-side code
  const publicFiles = ['src/app', 'src/components', 'src/hooks'];
  let hasSecurityIssues = false;
  
  publicFiles.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        const result = execSync(`grep -r "sk_" ${dir} || true`, { encoding: 'utf8' });
        if (result.trim()) {
          console.error(`❌ Potential secret key exposure found in ${dir}`);
          hasSecurityIssues = true;
        }
      } catch (error) {
        // Ignore grep errors
      }
    }
  });
  
  if (!hasSecurityIssues) {
    console.log('✅ No obvious security issues detected\n');
  } else {
    console.log('Please review and fix security issues before deploying.\n');
  }
}

// Main deployment process
function main() {
  checkProductionReadiness();
  runLint();
  runBuild();
  securityCheck();
  
  console.log('🎉 Production deployment checks completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Deploy to Vercel: vercel --prod');
  console.log('2. Update your Google OAuth redirect URIs to include https://tnfashion.vercel.app');
  console.log('3. Test the production deployment thoroughly');
  console.log('4. Update your Stripe webhook endpoints if using live keys');
  console.log('5. Set up monitoring and analytics');
}

if (require.main === module) {
  main();
}

#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating secure NextAuth secret for production...\n');

// Generate a secure random string
const secret = crypto.randomBytes(32).toString('base64');

console.log('Add this to your Vercel environment variables:\n');
console.log('NEXTAUTH_SECRET=' + secret);
console.log('\n⚠️  Keep this secret safe and never commit it to your repository!');
console.log('✅ This secret is cryptographically secure and ready for production use.\n'); 
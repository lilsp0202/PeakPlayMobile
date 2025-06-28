const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

const envTemplate = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/peakplay?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/peakplay?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${generateSecret()}"

# JWT
JWT_SECRET="${generateSecret()}"

# Email (Optional)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="noreply@example.com"

# PWA
NEXT_PUBLIC_PWA_URL="http://192.168.1.75:3000"

# Sentry (Optional)
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
SENTRY_AUTH_TOKEN="your-auth-token"
`;

const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

// Create .env.example if it doesn't exist
if (!fs.existsSync(envExamplePath)) {
  fs.writeFileSync(envExamplePath, envTemplate);
  console.log('✅ Created .env.example file');
}

// Create .env if it doesn't exist
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file');
} else {
  console.log('⚠️ .env file already exists. Please update it manually if needed.');
}

console.log('\n📝 Next steps:');
console.log('1. Update DATABASE_URL in .env with your PostgreSQL credentials');
console.log('2. Run: npx prisma generate');
console.log('3. Run: npx prisma migrate dev');
console.log('4. Start the development server: npm run dev\n'); 
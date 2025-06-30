# 🔧 Fix Vercel Authentication Issue

## Current Situation
- ✅ peakplayai.com is accessible and shows your PWA
- ❌ Sign-in feature doesn't work with valid credentials
- ❌ Vercel deployment URLs return 401 (Unauthorized)

## The Real Issue
The 401 error on Vercel URLs suggests **Vercel Deployment Protection** is enabled at the project level, not password protection.

## Solution Steps

### Step 1: Check Vercel Project Settings

1. **Go to Vercel Dashboard**:
   ```
   https://vercel.com/shreyasprasanna25-6637s-projects/peakplay/settings
   ```

2. **Navigate to**: Settings → Security & Privacy

3. **Disable ALL of these**:
   - [ ] Deployment Protection
   - [ ] Vercel Authentication
   - [ ] Preview Deployment Protection
   - [ ] Production Deployment Protection

### Step 2: Check Domain Configuration

Since peakplayai.com works but sign-in doesn't, check:

1. **Domain Settings**:
   ```
   https://vercel.com/shreyasprasanna25-6637s-projects/peakplay/settings/domains
   ```

2. **Ensure peakplayai.com is**:
   - Set as the production domain
   - Has SSL certificate (green checkmark)
   - No redirect rules interfering

### Step 3: Fix Authentication Configuration

The sign-in issue is likely due to NEXTAUTH configuration. Let's update:

```bash
# Remove all auth-related env vars
vercel env rm NEXTAUTH_URL
vercel env rm NEXT_PUBLIC_APP_URL

# Add them with the correct domain (without www)
vercel env add NEXTAUTH_URL
# Enter: https://peakplayai.com

vercel env add NEXT_PUBLIC_APP_URL  
# Enter: https://peakplayai.com
```

### Step 4: Add Missing Environment Variables

Check if these are needed:

```bash
# If using OpenAI features
vercel env add OPENAI_API_KEY

# If using Google OAuth (optional)
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET

# System API key for cron jobs
vercel env add SYSTEM_API_KEY
```

### Step 5: Database Connection Test

Test if the database is accessible from Vercel:

```bash
# Create a test API route
cat > src/app/api/test-db/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  try {
    const prisma = new PrismaClient();
    const userCount = await prisma.user.count();
    await prisma.$disconnect();
    
    return NextResponse.json({ 
      status: 'Database connected',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'Database connection failed',
      error: error.message 
    }, { status: 500 });
  }
}
EOF

# Deploy and test
vercel --prod

# Test the endpoint
curl https://peakplayai.com/api/test-db
```

### Step 6: Debug NextAuth Configuration

Update your NextAuth configuration to log errors:

```typescript
// In src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  // ... existing config
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error('NextAuth Error:', code, metadata);
    },
    warn: (code) => {
      console.warn('NextAuth Warning:', code);
    },
    debug: (code, metadata) => {
      console.log('NextAuth Debug:', code, metadata);
    },
  },
  // ... rest of config
};
```

### Step 7: Immediate Workaround

While fixing Vercel, use the Cloudflare tunnel:

```bash
# Your tunnel URL from earlier
https://archives-poultry-exclusion-flower.trycloudflare.com

# This should work perfectly with authentication!
```

## Quick Test Checklist

After making changes:

1. **Test database connection**:
   ```bash
   curl https://peakplayai.com/api/test-db
   ```

2. **Test authentication**:
   - Visit https://peakplayai.com
   - Try signing in with hello@gmail.com

3. **Check browser console** for errors:
   - Open DevTools (F12)
   - Look for NextAuth errors
   - Check Network tab for failed requests

## Most Likely Fix

Based on your situation, the issue is probably:

1. **NEXTAUTH_URL mismatch**: Must match exactly how users access the site
2. **Database URL encoding**: The password special characters need proper encoding
3. **Vercel deployment protection**: Hidden setting blocking access

## Immediate Action

1. **Use Cloudflare tunnel** for immediate access (works perfectly)
2. **Fix Vercel settings** in the dashboard
3. **Redeploy** after environment variable changes

Your PWA is working! Just need to fix the authentication configuration. 
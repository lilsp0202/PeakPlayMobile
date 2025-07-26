# Deployment Guide

This guide covers deploying PeakPlay to production using Vercel and PostgreSQL.

## Prerequisites

- Vercel account
- PostgreSQL database (Neon, Supabase, or Railway recommended)
- Domain name (optional)
- GitHub repository connected to Vercel

## Database Setup

### Option 1: Neon (Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to Vercel environment variables

### Option 2: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy connection string (use "Transaction" mode)
4. Add to Vercel environment variables

### Option 3: Railway

1. Create project at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy DATABASE_URL from service
4. Add to Vercel environment variables

## Vercel Deployment

### 1. Initial Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### 2. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Production Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-strong-secret"

# Google OAuth (if enabled)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# OpenAI (if using voice features)
OPENAI_API_KEY="..."

# Sentry
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_ORG="..."
SENTRY_PROJECT="..."
SENTRY_AUTH_TOKEN="..."

# Feature Flags
ENABLE_GOOGLE_AUTH="true"
ENABLE_VOICE_FEATURES="true"
ENABLE_MARKETPLACE="true"

# Analytics (optional)
NEXT_PUBLIC_GA_ID="G-..."
```

### 3. Database Migration

Before first deployment:

```bash
# Set production DATABASE_URL locally
export DATABASE_URL="your-production-url"

# Run migrations
npm run db:migrate:prod

# Verify connection
npm run db:studio
```

### 4. Deploy

```bash
# Deploy to production
vercel --prod

# Or use GitHub integration for automatic deploys
```

## Post-Deployment Setup

### 1. Configure Domain

In Vercel Dashboard:
1. Go to Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### 2. Update OAuth Callbacks

For Google OAuth:
1. Go to Google Cloud Console
2. Update authorized redirect URIs:
   - `https://your-domain.com/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/callback/google`

### 3. Set up Monitoring

1. **Sentry**:
   - Create project at sentry.io
   - Add DSN to environment variables
   - Deploy to create first release

2. **Vercel Analytics**:
   - Enable in Vercel Dashboard
   - Add to `app/layout.tsx` if needed

### 4. Configure Edge Functions

For optimal performance, configure edge runtime:

```typescript
// In API routes that can run on edge
export const runtime = 'edge';
```

## Production Checklist

### Security
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database has SSL enabled
- [ ] API routes have rate limiting
- [ ] CORS is properly configured
- [ ] Security headers are set

### Performance
- [ ] Images are optimized
- [ ] Database queries are indexed
- [ ] Static assets are cached
- [ ] PWA is properly configured
- [ ] Lighthouse score > 90

### Monitoring
- [ ] Sentry is catching errors
- [ ] Logs are accessible
- [ ] Uptime monitoring is set
- [ ] Database backups are configured

### Legal
- [ ] Privacy policy is accessible
- [ ] Cookie consent is working
- [ ] Data deletion endpoint works
- [ ] Terms of service is published

## Maintenance

### Database Backups

For Neon/Supabase:
- Automatic daily backups included
- Set up point-in-time recovery

For custom PostgreSQL:
```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Updates

1. **Dependencies**:
   ```bash
   npm update
   npm audit fix
   ```

2. **Database Migrations**:
   ```bash
   npm run db:migrate:prod
   ```

3. **Redeployment**:
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Build Failures

1. Check build logs in Vercel
2. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Prisma generation issues

Fix:
```bash
# Clear cache and rebuild
vercel --force
```

### Database Connection Issues

1. Verify DATABASE_URL format
2. Check SSL requirements:
   ```
   postgresql://...?sslmode=require
   ```
3. Ensure IP whitelisting (if required)

### Performance Issues

1. Enable Vercel Edge Config
2. Optimize database queries:
   ```sql
   -- Add indexes
   CREATE INDEX idx_user_email ON "User"(email);
   CREATE INDEX idx_match_date ON "Match"("matchDate");
   ```

3. Use ISR for static content:
   ```typescript
   export const revalidate = 3600; // 1 hour
   ```

## Scaling Considerations

### Database
- Enable connection pooling
- Use read replicas for analytics
- Implement caching layer (Redis)

### Application
- Use Vercel Edge Functions
- Implement CDN for assets
- Enable Vercel Image Optimization

### Monitoring
- Set up alerts for errors
- Monitor database performance
- Track API response times

## Cost Optimization

1. **Vercel**: Use appropriate plan based on traffic
2. **Database**: Monitor connection usage
3. **External APIs**: Implement caching
4. **Storage**: Use Vercel Blob for uploads

## Rollback Procedure

If issues occur:

1. **Instant Rollback**:
   ```bash
   vercel rollback
   ```

2. **Database Rollback**:
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup.sql
   ```

3. **Git Revert**:
   ```bash
   git revert HEAD
   git push origin main
   ``` 
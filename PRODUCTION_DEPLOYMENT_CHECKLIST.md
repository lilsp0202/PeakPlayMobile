# PeakPlay Production Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Code Quality
- ✅ Build passes successfully (`npm run build`)
- ✅ TypeScript errors fixed (critical ones)
- ✅ All changes committed and pushed to GitHub

### 2. Database
- ✅ PostgreSQL + Supabase connection verified
- ✅ Database schema up to date
- ✅ Test data available (14 users, skills, badges)

### 3. Features Verified
- ✅ Authentication flow (Landing → Signup/Signin → Onboarding → Dashboard)
- ✅ Mobile-friendly UI improvements
- ✅ Profile modal enhanced for mobile
- ✅ Academy-based coach-athlete isolation
- ✅ Badge centre functionality
- ✅ SkillSnap working for athletes and coaches
- ✅ Progress tracking with real data
- ✅ Match centre with user isolation
- ✅ Smart notifications
- ✅ PWA functionality (manifest, service worker, icons)

## 🚀 Deployment to Vercel

### Environment Variables Required

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[project-id]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[project-id]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://peakplayai.com"
NEXTAUTH_SECRET="[generate-secure-secret]"

# Optional (if using features)
OPENAI_API_KEY="[your-openai-key]"
SENTRY_DSN="[your-sentry-dsn]"
```

### Deployment Steps

1. **Via Vercel Dashboard:**
   - Go to https://vercel.com/dashboard
   - Select the PeakPlay project
   - Go to Settings → Environment Variables
   - Add all required environment variables
   - Trigger a new deployment

2. **Via CLI (if needed):**
   ```bash
   vercel --prod
   ```

### Domain Configuration
- Primary domain: peakplayai.com
- SSL: Automatic via Vercel
- DNS: Configure A/CNAME records as per Vercel instructions

## 📱 Post-Deployment Testing

### 1. Core Functionality
- [ ] Landing page loads at peakplayai.com
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Onboarding redirects properly
- [ ] Dashboard loads for both athletes and coaches

### 2. PWA Testing
- [ ] Service worker registers
- [ ] App installable on mobile
- [ ] Offline page works
- [ ] Icons and splash screens display correctly

### 3. Database Operations
- [ ] Skills can be saved and loaded
- [ ] Matches can be created and viewed
- [ ] Badges display correctly
- [ ] User profiles update properly

### 4. Mobile Testing
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test PWA installation on both platforms
- [ ] Verify responsive design

## 🔗 Important URLs

- **Production**: https://peakplayai.com
- **GitHub**: https://github.com/lilsp0202/PeakPlay
- **Vercel Dashboard**: https://vercel.com/[your-username]/peakplay
- **Database (Supabase)**: https://supabase.com/dashboard/project/[project-id]

## 📊 Monitoring

- **Analytics**: Google Analytics (if configured)
- **Error Tracking**: Sentry
- **Performance**: Vercel Analytics
- **Uptime**: Vercel Status Page

## 🚨 Rollback Plan

If issues arise:
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

## 📝 Notes

- Database migrations are handled via Prisma
- Cron job for badge evaluation runs daily at midnight
- API routes have proper caching headers
- PWA updates automatically with new deployments 
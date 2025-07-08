# PeakPlay Development Workflow

This guide will help you make changes to the PeakPlay application locally without disrupting the production deployment on Vercel.

## 🚀 Quick Start Development Environment

### 1. Start Development Services

Run these commands to start your local development environment:

```bash
# Clean up any existing processes
pkill -f "next dev" && pkill -f "prisma studio"

# Clear cache and regenerate Prisma client
rm -rf .next && npx prisma generate

# Start development server (in background)
npm run dev > dev.log 2>&1 &

# Start Prisma Studio for database management (in background)
npx prisma studio --port 5555 > prisma.log 2>&1 &
```

### 2. Verify Services are Running

Check that all services are operational:

```bash
# Check service status
curl -s -I http://localhost:3000 | head -1    # Main App
curl -s -I http://localhost:5555 | head -1    # Prisma Studio  
curl -s -I http://192.168.1.75:3000 | head -1 # PWA

# Test database connection
curl -s http://localhost:3000/api/test-db | jq
```

### 3. Access Your Development Environment

- **Main Application**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555
- **PWA (Mobile Testing)**: http://192.168.1.75:3000

## 🔄 Development Workflow

### Making Changes

1. **Code Changes**: Edit files in `src/` directory
2. **Database Changes**: Use Prisma Studio or edit `prisma/schema.prisma`
3. **Hot Reload**: Changes are automatically reflected (no restart needed)

### Testing Changes

1. **Manual Testing**: Use localhost URLs above
2. **Database Testing**: Use Prisma Studio to inspect/modify data
3. **Mobile Testing**: Use the PWA URL on mobile devices

### Before Committing

1. **Check Logs**: `tail -20 dev.log` for any errors
2. **Test Core Features**: Authentication, coach assignment, badge system
3. **Build Test**: `npm run build` to ensure production build works

## 🚢 Deployment to Production

### Only When Ready

```bash
# Commit your changes
git add .
git commit -m "Your descriptive commit message"

# Push to GitHub (triggers Vercel deployment)
git push origin main

# Optional: Manual Vercel deployment
vercel --prod
```

## 🛠️ Troubleshooting

### If Services Won't Start

```bash
# Kill all related processes
pkill -f "next" && pkill -f "prisma" && pkill -f "node"

# Clean everything
rm -rf .next node_modules/.cache

# Reinstall if needed
npm install

# Restart development environment
npm run dev > dev.log 2>&1 &
npx prisma studio --port 5555 > prisma.log 2>&1 &
```

### If Database Issues Occur

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# Or push schema changes
npx prisma db push
```

### Check Logs for Errors

```bash
# Development server logs
tail -f dev.log

# Prisma Studio logs  
tail -f prisma.log

# Real-time monitoring
tail -f dev.log & tail -f prisma.log
```

## 📝 Environment Isolation

### Local vs Production

- **Local**: Uses your local database and environment variables
- **Production**: Uses Vercel environment and production database
- **No Cross-Contamination**: Changes made locally don't affect production until deployed

### Environment Variables

- Local environment uses `.env` file
- Production uses Vercel environment variables
- Database URLs are different (local vs production)

## 🔧 Useful Commands

### Development

```bash
# Start fresh development environment
npm run dev

# Build for production testing
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Database

```bash
# Open Prisma Studio
npx prisma studio

# Apply schema changes
npx prisma db push

# Generate Prisma client
npx prisma generate

# View database in browser
open http://localhost:5555
```

### Production Deployment

```bash
# Check Vercel deployments
vercel ls

# Check domain status
vercel domains ls

# Deploy to production
vercel --prod
```

## ✅ Best Practices

1. **Always test locally first** before deploying to production
2. **Use meaningful commit messages** for easy tracking
3. **Test on mobile** using the PWA URL
4. **Check logs regularly** for early error detection
5. **Keep production stable** - only deploy tested changes

## 🎯 Current Working Setup

As of now, your development environment is configured with:

- ✅ Main App: http://localhost:3000 (Ready)
- ✅ Prisma Studio: http://localhost:5555 (Ready)  
- ✅ PWA: http://192.168.1.75:3000 (Ready)
- ✅ Database: Connected (14 users)
- ✅ All services: Running in background

## 🆘 Emergency Commands

If something breaks completely:

```bash
# Nuclear option - restart everything
pkill -f "next" && pkill -f "prisma" && pkill -f "node"
rm -rf .next node_modules/.cache
npm install
rm -rf .next && npx prisma generate
npm run dev > dev.log 2>&1 &
npx prisma studio --port 5555 > prisma.log 2>&1 &
```

---

You're now ready to develop safely without affecting your production deployment! 🚀 
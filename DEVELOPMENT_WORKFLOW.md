# PeakPlay Development Workflow

## 🚀 **Branching Strategy**

### **Production Environment**
- **Branch**: `production`
- **Purpose**: Production deployments
- **Vercel URL**: Will be configured as production environment
- **Deployment**: Automatic on push to `production` branch

### **Development/Staging Environment**
- **Branch**: `main`
- **Purpose**: Development and staging
- **Vercel URL**: Will be configured as preview environment
- **Deployment**: Automatic on push to `main` branch

## 📋 **Development Workflow**

### **1. Daily Development**
```bash
# Work on main branch for development
git checkout main
git pull mobile main

# Make your changes
# ... code changes ...

# Commit and push
git add .
git commit -m "feat: your feature description"
git push mobile main
```

### **2. Production Deployment**
```bash
# Switch to production branch
git checkout production

# Merge latest changes from main
git merge main

# Push to production (triggers production deployment)
git push mobile production

# Switch back to main for continued development
git checkout main
```

### **3. Hotfix Process**
```bash
# Create hotfix branch from production
git checkout production
git checkout -b hotfix/critical-fix

# Make the fix
# ... fix code ...

# Push hotfix
git add .
git commit -m "hotfix: critical fix description"
git push mobile hotfix/critical-fix

# Merge to production
git checkout production
git merge hotfix/critical-fix
git push mobile production

# Merge back to main
git checkout main
git merge production
git push mobile main
```

## 🔧 **Local Development Setup**

### **Start Development Servers**
```bash
# Terminal 1: Next.js Development Server
npm run dev

# Terminal 2: Database Management
npx prisma studio --port 5555
```

### **Access URLs**
- **Local Development**: `http://localhost:3000`
- **Local PWA**: `http://192.168.1.213:3000`
- **Database Studio**: `http://localhost:5555`

## 📦 **Deployment Configuration**

### **Vercel Settings**
1. **Production Environment**:
   - Connected to: `production` branch
   - Environment: Production
   - Domain: Custom production domain

2. **Preview Environment**:
   - Connected to: `main` branch
   - Environment: Preview
   - Domain: Auto-generated preview URL

### **Environment Variables**
- Configure environment variables for both environments in Vercel dashboard
- Production and preview environments should have separate database connections

## 🧪 **Testing & Quality Assurance**

### **Before Production Deployment**
```bash
# Run build test
npm run build

# Run tests (if available)
npm test

# Check for linting errors
npm run lint
```

### **Deployment Checklist**
- [ ] All tests passing
- [ ] Build successful
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Team creation functionality tested
- [ ] PWA features working

## 🚦 **Branch Protection Rules**

### **Recommended Settings**
- **Production Branch**: 
  - Require pull request reviews
  - Require status checks to pass
  - Require up-to-date branches

- **Main Branch**:
  - Allow direct pushes for development
  - Require builds to pass

## 📱 **Features Status**

### **✅ Currently Working**
- User authentication (NextAuth.js)
- Team creation functionality
- Dashboard with skill tracking
- Badge system
- PWA capabilities
- Database integration (Prisma + Supabase)

### **🔧 Environment Health**
- **Build Status**: ✅ Successful
- **Database**: ✅ Connected
- **API Endpoints**: ✅ Functional
- **Authentication**: ✅ Working
- **PWA**: ✅ Enabled

## 📞 **Support**

For issues with deployment or development workflow:
1. Check build logs in Vercel dashboard
2. Review terminal output for errors
3. Ensure all environment variables are set
4. Verify database connectivity

---

**Last Updated**: $(date)
**Current Version**: Production-ready with team creation functionality 
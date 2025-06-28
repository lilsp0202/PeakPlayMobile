# PeakPlay Mobile Prototype

A Next.js + Prisma + TypeScript PWA for athlete development.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/peakplay?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# JWT
JWT_SECRET="your-jwt-secret"

# Email (optional)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="noreply@example.com"

# PWA
NEXT_PUBLIC_PWA_URL="http://192.168.1.75:3000"
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lilsp0202/PeakPlayMobile-prototype.git
   cd PeakPlayMobile-prototype
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Web: http://localhost:3000
- PWA: http://192.168.1.75:3000
- Prisma Studio: http://localhost:5555

## Features

- Athlete Development Tracking
- Skill Assessment
- Badge System
- Real-time Progress Monitoring
- PWA Support
- Offline Capabilities

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma studio` - Open Prisma Studio

## Testing

```bash
npm run test
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Test Accounts

The application comes with pre-configured test accounts:

### Athlete Account
- **Email**: `student@transform.com`
- **Password**: `password123`
- **Features**: Skills tracking, badge earning, performance analytics

### Coach Account  
- **Email**: `coach@transform.com`
- **Password**: `password123`
- **Features**: Student management, academy oversight, progress tracking

## 📱 PWA Features

### Installation
- **Desktop**: Click the install button in your browser's address bar
- **Mobile**: Use "Add to Home Screen" option in your browser menu
- **Works Offline**: Full functionality even without internet connection

### Key Capabilities
- 📱 **Progressive Web App** - Install like a native app
- 🔒 **Secure Authentication** - NextAuth.js with role-based access
- 🏆 **Badge System** - Automatic badge evaluation and rewards
- 📊 **Performance Tracking** - Comprehensive skills and analytics
- 👥 **Multi-Role Support** - Athletes, Coaches, and Academy management
- 🎨 **Modern UI** - Beautiful gradients and responsive design

## 🏗️ Project Structure

```
src/
├── app/                     # Next.js 14 App Router
│   ├── api/                # API routes for all backend functionality
│   ├── auth/               # Authentication pages (signin, signup)
│   ├── dashboard/          # Main user dashboard
│   ├── onboarding/         # User profile setup flows
│   └── marketplace/        # Coach marketplace features
├── components/             # Reusable UI components
│   ├── SkillSnap.tsx      # Performance tracking component
│   ├── BadgeManager.tsx   # Badge system management
│   ├── SessionTodo*.tsx   # Task management for users
│   └── PWA*.tsx           # Progressive Web App components
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   └── badgeEngine.ts    # Badge evaluation system
└── types/                # TypeScript definitions
```

## 🎮 User Flows

### New Athlete Registration
1. Sign up with email/username/password
2. Complete athlete questionnaire (age, height, weight, academy, sport)
3. Access personalized dashboard with:
   - SkillSnap performance tracking
   - Badge display and progress
   - Academy information
   - Performance analytics

### New Coach Registration  
1. Sign up with email/username/password
2. Complete coach profile setup
3. Access coach dashboard with:
   - Student management by academy
   - Performance oversight tools
   - Badge system administration
   - Academy analytics

### Existing User Login
1. Sign in with email and password
2. Automatic redirect to role-appropriate dashboard
3. Full access to saved data and progress

## 🎨 Features Deep Dive

### SkillSnap Performance Tracking
- **Physical Skills**: Push-ups, pull-ups, sprint times, endurance
- **Technical Skills**: Sport-specific skills (Cricket batting, bowling, fielding)
- **Mental & Nutrition**: Mood scoring, nutrition tracking, sleep analysis
- **Real-time Analytics**: Age-group comparisons and progress tracking

### Badge System
- **Automatic Evaluation**: Background processing of achievements
- **Beautiful Design**: Gradient backgrounds for different badge levels
- **Progress Tracking**: Visual progress indicators
- **Coach Management**: Coaches can create custom badges

### Academy Management
- **Multi-Academy Support**: Students and coaches organized by academy
- **Assignment System**: Coaches can assign unassigned students
- **Performance Oversight**: Academy-wide analytics and progress tracking

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add production environment variables
3. **Database**: Configure PostgreSQL for production
4. **Deploy**: Automatic deployment on git push

### Production Environment Variables
```env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_URL="https://your-domain.vercel.app"  
NEXTAUTH_SECRET="your-production-secret"
```

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill processes on ports 3000 and 5555
pkill -f "next dev"
pkill -f "prisma studio"
```

**Database Issues**
```bash
# Reset database
rm prisma/dev.db
npx prisma db push
```

**Missing Dependencies**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**PWA Not Installing**
- Ensure HTTPS in production
- Check manifest.json configuration
- Verify service worker registration

## 🙏 Acknowledgments

- Built with Next.js 14 and modern web technologies
- Designed for sports academies and athletic development
- Inspired by the need for comprehensive sports management tools

---

**PeakPlay** - Elevating athletic performance through technology 🏆

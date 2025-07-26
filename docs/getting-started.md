# Getting Started

This guide will help you set up PeakPlay for local development.

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+ (for production setup)
- Git
- A code editor (VS Code recommended)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/lilsp0202/PeakPlayMobile-prototype.git
cd peakplay-prototype
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Database (use SQLite for local dev)
DATABASE_URL="file:./dev.db"

# For PostgreSQL (production):
# DATABASE_URL="postgresql://user:password@localhost:5432/peakplay_dev"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-here"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Optional: OpenAI for voice features
OPENAI_API_KEY="your-api-key"

# Development flags
ENABLE_GOOGLE_AUTH="false"
ENABLE_VOICE_FEATURES="false"
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Database Setup

For local development with SQLite:

```bash
# Generate Prisma client
npm run db:generate

# Create database and run migrations
npm run db:push

# Seed with sample data
npm run db:seed
```

For PostgreSQL setup:

```bash
# Ensure PostgreSQL is running
# Update DATABASE_URL in .env.local

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

## Development Workflow

### Code Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/         # API routes
│   ├── auth/        # Authentication pages
│   └── dashboard/   # Protected pages
├── components/      # React components
├── lib/            # Utilities and configurations
│   ├── auth.ts     # NextAuth configuration
│   ├── prisma.ts   # Prisma client
│   └── validations.ts # Zod schemas
└── types/          # TypeScript type definitions
```

### Common Commands

```bash
# Development
npm run dev           # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Create migration
npm run db:reset     # Reset database

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run type-check   # Check TypeScript

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### Making Changes

1. **API Routes**: Add new routes in `src/app/api/`
2. **Components**: Create reusable components in `src/components/`
3. **Database Changes**: 
   - Update `prisma/schema.prisma`
   - Run `npm run db:migrate`
   - Update seed scripts if needed

### Authentication

Default test accounts after seeding:

**Athlete Account:**
- Email: athlete@example.com
- Password: password123

**Coach Account:**
- Email: coach@example.com
- Password: password123

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL format
   - Run `npm run db:generate` after schema changes

2. **Build Errors**
   - Clear cache: `rm -rf .next`
   - Reinstall deps: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run type-check`

3. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check session configuration
   - Clear browser cookies

### Debug Mode

Enable debug logging:

```env
# .env.local
DEBUG=*
```

View Prisma queries:

```env
# .env.local
DATABASE_URL="postgresql://...?schema=public&connection_limit=1"
```

## Next Steps

- Review the [API Reference](./api-reference.md)
- Learn about [Testing](./testing.md)
- Read the [Deployment Guide](./deployment.md)
- Check [Security Best Practices](./security.md) 
# Supabase PostgreSQL Setup Guide

## Prerequisites
- A Supabase account (free tier is sufficient)
- Access to your project's environment variables

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the project details:
   - **Project name**: `peakplay-production`
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is fine for development

## Step 2: Get Your Database Connection String

1. Once your project is created, go to **Settings** → **Database**
2. Under **Connection string**, find the **URI** section
3. Copy the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Step 3: Configure Environment Variables

1. Update your `.env.local` file:
   ```env
   # Replace with your actual Supabase connection string
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

2. For production deployment (Vercel), add these same environment variables to your Vercel project settings.

## Step 4: Update Prisma Schema

The Prisma schema is already configured for PostgreSQL. Make sure it includes:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Step 5: Run Database Migration

1. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

2. Push the schema to Supabase:
   ```bash
   npx prisma db push
   ```

3. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```

## Step 6: Enable Row Level Security (RLS)

For production security, enable RLS on all tables:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Policies**
3. Enable RLS for each table
4. Create appropriate policies for your application needs

## Example RLS Policies

### Users Table
```sql
-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
FOR UPDATE USING (auth.uid() = id);
```

### Skills Table
```sql
-- Users can view their own skills
CREATE POLICY "Users can view own skills" ON skills
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM users WHERE id = skills.user_id
  )
);
```

## Step 7: Configure Supabase Auth (Optional)

If you want to use Supabase Auth instead of NextAuth:

1. Go to **Authentication** → **Settings**
2. Configure your auth providers
3. Update redirect URLs for your domain

## Troubleshooting

### Connection Issues
- Ensure your database password doesn't contain special characters that need URL encoding
- Check if your IP is whitelisted (Supabase allows all IPs by default)
- Use `pgbouncer=true` in the connection string for serverless environments

### Migration Errors
- Run `npx prisma migrate reset` to reset the database (WARNING: This deletes all data)
- Check Prisma schema syntax with `npx prisma validate`

### Performance Tips
- Use connection pooling with PgBouncer (included in connection string)
- Set appropriate connection limits
- Consider using Supabase Edge Functions for complex queries

## Next Steps

1. Set up database backups in Supabase dashboard
2. Configure monitoring and alerts
3. Implement caching strategies for frequently accessed data
4. Set up a staging environment with a separate Supabase project 
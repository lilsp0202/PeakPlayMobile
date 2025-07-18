import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import * as Sentry from "@sentry/nextjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔍 Authorize called with credentials:', { email: credentials?.email, password: '***' });
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase().trim() 
            },
            include: {
              student: true,
              coach: true
            }
          });

          console.log('👤 User found:', user ? { id: user.id, email: user.email, role: user.role } : 'None');

          if (!user || !user.password) {
            // Log failed login attempt
            await logAuthEvent('LOGIN_FAILED', credentials.email, 'Invalid credentials');
            throw new Error("Invalid email or password");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log('🔐 Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            // Log failed login attempt
            await logAuthEvent('LOGIN_FAILED', user.email, 'Invalid password');
            throw new Error("Invalid email or password");
          }

          console.log('✅ Authentication successful for:', user.email);
          
          // Log successful login
          await logAuthEvent('LOGIN_SUCCESS', user.email);

          // Check if user needs onboarding
          const needsOnboarding = user.role === "ATHLETE" ? !user.student : !user.coach;
          
          return {
            id: user.id,
            email: user.email,
            name: needsOnboarding ? "temp" : (user.name || user.username),
            role: user.role as "ATHLETE" | "COACH",
          };
        } catch (error) {
          console.error('❌ Authentication error:', error);
          Sentry.captureException(error);
          throw new Error("Authentication failed");
        }
      }
    }),
    ...(process.env.ENABLE_GOOGLE_AUTH === 'true' && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        },
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            role: "ATHLETE" as const,
          }
        },
      })
    ] : []),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Create new user from Google OAuth
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || undefined,
                username: user.email!.split('@')[0],
                role: "ATHLETE",
                emailVerified: new Date(),
                image: user.image || undefined,
              }
            });
          }
          
          // Log OAuth login
          await logAuthEvent('OAUTH_LOGIN_SUCCESS', user.email!, 'google');
          return true;
        } catch (error) {
          console.error('OAuth sign in error:', error);
          Sentry.captureException(error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.name = user.name; // Ensure temp status is preserved
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && token.sub) {
        session.user = {
          ...session.user,
          id: token.sub,
          role: token.role as "ATHLETE" | "COACH",
          name: token.name as string, // Ensure temp status is preserved
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Handle dynamic Vercel URLs
      const deploymentUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXTAUTH_URL 
        ? process.env.NEXTAUTH_URL 
        : baseUrl;
      
      // Allow relative URLs
      if (url.startsWith("/")) return `${deploymentUrl}${url}`;
      // Allow URLs on the same origin
      else if (new URL(url).origin === deploymentUrl) return url;
      return deploymentUrl;
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signin",
    error: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  events: {
    async signOut({ token }: { token: any }) {
      if (token?.email) {
        await logAuthEvent('LOGOUT', token.email as string);
      }
    }
  }
};

// Helper function to log auth events
async function logAuthEvent(event: string, email: string, details?: string) {
  try {
    console.log(`[AUTH_EVENT] ${event} - ${email} ${details ? `- ${details}` : ''}`);
    // In production, you might want to store these in a database
    // await prisma.authLog.create({
    //   data: { event, email, details, timestamp: new Date() }
    // });
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 
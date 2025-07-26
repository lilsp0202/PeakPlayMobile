import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Conditional Sentry import with error handling
let Sentry: any = null;
try {
  if (typeof window === 'undefined') {
    // Only import Sentry on server-side and if available
    Sentry = require("@sentry/nextjs");
  }
} catch (error) {
  console.warn('Sentry not available:', error);
  Sentry = null;
}

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
          
          if (!isPasswordValid) {
            await logAuthEvent('LOGIN_FAILED', credentials.email, 'Invalid password');
            throw new Error("Invalid email or password");
          }

          // Log successful login
          await logAuthEvent('LOGIN_SUCCESS', user.email, `Role: ${user.role}`);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            student: user.student,
            coach: user.coach
          };
        } catch (error) {
          console.error('❌ Authorize error:', error);
          
          // Log auth errors to Sentry if available
          if (Sentry) {
            Sentry.captureException(error);
          }
          
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("An error occurred during authentication");
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.student = user.student;
        token.coach = user.coach;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.student = token.student as any;
        session.user.coach = token.coach as any;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Handle Google OAuth sign-in
        if (account?.provider === "google" && profile?.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email.toLowerCase() }
          });

          if (!existingUser) {
            // Create new user for Google sign-in
            const newUser = await prisma.user.create({
              data: {
                email: profile.email.toLowerCase(),
                name: profile.name || "Google User",
                username: profile.email.split('@')[0], // Generate username from email
                role: "STUDENT", // Default role for Google sign-ups
                password: "", // No password for OAuth users
              }
            });
            
            await logAuthEvent('GOOGLE_SIGNUP', newUser.email, 'New user created via Google OAuth');
            return true;
          } else {
            await logAuthEvent('GOOGLE_LOGIN', existingUser.email, 'Existing user login via Google OAuth');
            return true;
          }
        }
        
        return true;
      } catch (error) {
        console.error('❌ SignIn callback error:', error);
        if (Sentry) {
          Sentry.captureException(error);
        }
        return false;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signin",
    error: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  // PERFORMANCE: Add secure cookie settings for production
  useSecureCookies: process.env.NODE_ENV === "production",
  // Production-ready cookie configuration
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? "peakplayai.com" : undefined,
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? "peakplayai.com" : undefined,
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.csrf-token" : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? "peakplayai.com" : undefined,
      },
    },
  },
};

// authOptions is already exported above as const export 
import NextAuth from "next-auth"
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
    updateAge: 24 * 60 * 60, // 24 hours - update session more frequently for better performance
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Optimize JWT processing for production
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === "google") {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user with Google profile
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                role: "ATHLETE", // Default role for Google sign-ups
                username: user.email.split("@")[0] + "_" + Math.random().toString(36).substr(2, 9), // Generate unique username
              },
            });

            // Log successful registration
            await logAuthEvent('GOOGLE_REGISTER', user.email);
            console.log('✅ New Google user created:', newUser.email);
          } else {
            // Log successful login
            await logAuthEvent('GOOGLE_LOGIN', user.email);
            console.log('✅ Existing Google user signed in:', existingUser.email);
          }

          return true;
        } catch (error) {
          console.error('❌ Google sign-in error:', error);
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
      const isVercelUrl = baseUrl.includes('vercel.app');
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isVercelUrl || isDevelopment) {
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        if (new URL(url).origin === baseUrl) return url;
        return baseUrl;
      }
      
      // Production logic
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
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
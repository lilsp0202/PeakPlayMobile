import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
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

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            student: true,
            coach: true
          }
        });

        console.log('🔍 User found:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');

        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log('🔍 Password validation:', isPasswordValid);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Add academy and username for both coach and athlete
        let academy = undefined;
        if (user.coach) academy = user.coach.academy;
        if (user.student) academy = user.student.academy;

        const authResult = {
          id: user.id,
          email: user.email,
          name: user.name || user.username,
          role: user.role as 'ATHLETE' | 'COACH',
          academy,
          username: user.username,
        };

        console.log('🔍 Authorize returning:', authResult);
        return authResult;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('🔍 JWT Callback - Token:', token, 'User:', user, 'Account:', account);
      if (user) {
        // First time JWT callback is invoked, user object is available
        token.sub = user.id;
        token.role = user.role;
        token.academy = user.academy;
        token.username = user.username;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔍 Session Callback - Session:', session, 'Token:', token);
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as 'ATHLETE' | 'COACH';
        session.user.academy = token.academy as string | undefined;
        session.user.username = token.username as string | undefined;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      console.log('🔍 Session Callback returning:', session);
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signin",
    error: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-for-development-change-in-production",
  debug: process.env.NODE_ENV === 'development'
}; 
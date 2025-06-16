import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
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

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Add academy and username for both coach and athlete
        let academy = undefined;
        if (user.coach) academy = user.coach.academy;
        if (user.student) academy = user.student.academy;

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.username,
          role: user.role as 'ATHLETE' | 'COACH',
          academy,
          username: user.username,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.academy = user.academy;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as 'ATHLETE' | 'COACH';
        session.user.academy = token.academy as string | undefined;
        session.user.username = token.username as string | undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin"
  }
}; 
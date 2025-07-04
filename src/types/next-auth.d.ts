declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: "ATHLETE" | "COACH";
      academy?: string;
      username?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role: "ATHLETE" | "COACH";
    academy?: string;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ATHLETE" | "COACH";
    academy?: string;
    username?: string;
  }
} 
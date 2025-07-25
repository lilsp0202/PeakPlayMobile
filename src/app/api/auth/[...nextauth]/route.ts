import { authOptions } from "@/lib/auth";

// Workaround for NextAuth import issue
const NextAuth = require("next-auth").default;
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 
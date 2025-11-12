import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "lib/db";
import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: creds.email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        return ok ? { id: user.id, email: user.email, name: user.name || null } as any : null;
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After credentials sign-in, send to /home
      if (url.startsWith("/")) return `${baseUrl}/home`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/home`;
    },
    session: async ({ session, token }) => {
      if (session?.user) (session.user as any).id = token.sub;
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) token.sub = user.id;
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

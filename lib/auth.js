import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import db from "@/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = db
          .prepare(
            "SELECT id, name, email, role, password FROM users WHERE email = ?"
          )
          .get(email);

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || "user",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role || "user";
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      const email = user?.email?.trim().toLowerCase();
      if (!email) return;

      const existingUser = db
        .prepare("SELECT id, role FROM users WHERE email = ?")
        .get(email);

      const userId = existingUser?.id || user?.id || randomUUID();
      const role = existingUser?.role || user?.role || "user";

      db.prepare(
        `
          INSERT INTO users (id, name, email, role)
          VALUES (@id, @name, @email, @role)
          ON CONFLICT(email) DO UPDATE SET
            name = excluded.name
        `
      ).run({
        id: userId,
        name: user?.name || "",
        email,
        role,
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-me",
};

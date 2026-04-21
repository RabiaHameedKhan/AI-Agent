import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import db, { ensureDatabase } from "@/lib/db";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const providers = [];

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      await ensureDatabase();

      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;

      if (!email || !password) {
        return null;
      }

      const [user] = await db`
        SELECT id, name, email, role, password
        FROM users
        WHERE email = ${email}
        LIMIT 1
      `;

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
  })
);

export const authOptions = {
  providers,
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
      try {
        await ensureDatabase();

        const email = user?.email?.trim().toLowerCase();
        if (!email) return;

        const [existingUser] = await db`
          SELECT id, role
          FROM users
          WHERE email = ${email}
          LIMIT 1
        `;

        const userId = existingUser?.id || user?.id || randomUUID();
        const role = existingUser?.role || user?.role || "user";

        await db`
          INSERT INTO users (id, name, email, role)
          VALUES (${userId}, ${user?.name || ""}, ${email}, ${role})
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name
        `;
      } catch (error) {
        console.error("NextAuth signIn event failed to persist user", error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-me",
};

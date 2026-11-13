import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        try {
          const { username, password } = loginSchema.parse(credentials);
          
          // Get user from database
          const result = await sql`
            SELECT id, username, password_hash, name, email
            FROM users
            WHERE username = ${username}
          `;
          
          if (result.rows.length === 0) {
            return null;
          }
          
          const user = result.rows[0];
          
          // Verify password
          const passwordMatch = await bcrypt.compare(password, user.password_hash);
          
          if (!passwordMatch) {
            return null;
          }
          
          // Update last login
          await sql`
            UPDATE users
            SET last_login = CURRENT_TIMESTAMP
            WHERE id = ${user.id}
          `;
          
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            username: user.username
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
});

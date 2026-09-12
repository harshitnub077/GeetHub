import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Dynamic NEXTAUTH_URL detection for Vercel Serverless / Preview deployments
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NEXT_PUBLIC_SITE_URL) {
    process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_SITE_URL;
  }
}

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || "geethub-production-jwt-auth-secret-key-2026";

const providers: any[] = [
  CredentialsProvider({
    id: "guest",
    name: "Guest Musician",
    credentials: {
      username: { label: "Musician Name", type: "text", placeholder: "e.g. Jimi Hendrix" },
    },
    async authorize(credentials) {
      const name = credentials?.username?.trim() || "Musician";
      return {
        id: `guest-${Date.now()}`,
        name: name,
        email: `${name.toLowerCase().replace(/[^a-z0-9]/g, "") || "musician"}@geethub.local`,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

const handler = NextAuth({
  providers,
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };

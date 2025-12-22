import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Email/Password Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.utilisateur.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashMotDePasse) {
          throw new Error("Identifiants invalides");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.hashMotDePasse
        );

        if (!passwordMatch) {
          throw new Error("Identifiants invalides");
        }

        if (!user.emailVerified) {
          throw new Error("Veuillez vérifier votre email avant de vous connecter");
        }

        return {
          id: user.idUtilisateur,
          email: user.email,
          role: user.role,
          name: user.nomComplet,
        };
      },
    }),
  ],
  
  callbacks: {
    async signIn({ user, account }: any) {
      // For OAuth sign-in (Google)
      if (account?.provider === "google") {
        const existingUser = await prisma.utilisateur.findUnique({
          where: { email: user.email! },
        });

        // If user doesn't exist, they need to complete registration
        if (!existingUser) {
          // Store temporary data in session for sign-up completion
          return `/auth/complete-signup?email=${user.email}&name=${user.name}&provider=google`;
        }

        // Auto-verify email for OAuth users
        if (!existingUser.emailVerified) {
          await prisma.utilisateur.update({
            where: { email: user.email! },
            data: { emailVerified: new Date() },
          });
        }
      }

      return true;
    },

    async session({ session, token }: any) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        
        // Get user role and additional info from database
        const user = await prisma.utilisateur.findUnique({
          where: { idUtilisateur: token.sub },
          select: { 
            role: true, 
            emailVerified: true,
            nomComplet: true,
          },
        });
        
        if (user) {
          session.user.role = user.role;
          session.user.emailVerified = user.emailVerified;
          session.user.name = user.nomComplet;
        }
      }
      return session;
    },

    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    
    async redirect({ url, baseUrl }: any) {
      // After successful login, redirect based on role
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Default redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  
  pages: {
    signIn: "/worker/sign-in", // Default sign-in page
    error: "/worker/sign-in",  // Error page
  },
  
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export const { GET, POST } = handlers;
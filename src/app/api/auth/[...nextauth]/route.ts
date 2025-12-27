import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
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

        // Email verification check disabled for now
        // if (!user.emailVerified) {
        //   throw new Error("Veuillez vérifier votre email avant de vous connecter");
        // }

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
    async signIn({ user, account, profile }: any) {
      // For OAuth sign-in (Google)
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.utilisateur.findUnique({
            where: { email: user.email! },
          });

          // If user doesn't exist, create them
          if (!existingUser) {
            const newUser = await prisma.utilisateur.create({
              data: {
                email: user.email!,
                nomComplet: user.name || profile?.name || "Google User",
                emailVerified: new Date(),
                role: "Travailleur", // Default role for now
                hashMotDePasse: null, // No password for OAuth users
              },
            });
            
            // Update user id for session
            user.id = newUser.idUtilisateur;
            
            console.log("Created new Google user:", newUser.email);
          } else {
            // Update emailVerified if not set
            if (!existingUser.emailVerified) {
              await prisma.utilisateur.update({
                where: { email: user.email! },
                data: { emailVerified: new Date() },
              });
            }
            
            // Set user id for session
            user.id = existingUser.idUtilisateur;
          }
          
          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }

      return true;
    },

    async session({ session, token }:any) {
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

    async jwt({ token, user, account }: any) {
      // On sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // For OAuth, get the user ID
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.utilisateur.findUnique({
          where: { email: user.email },
          select: { idUtilisateur: true, role: true }
        });
        
        if (dbUser) {
          token.sub = dbUser.idUtilisateur;
          token.role = dbUser.role;
        }
      }
      
      return token;
    },
    
    async redirect({ url, baseUrl }: any) {
      // If url is provided and starts with base URL, use it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Always redirect to dashboard after authentication
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
import NextAuth, { User, NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper function to check ban status
async function checkBanStatus(userId: string) {
  try {
    const activeBan = await prisma.ban.findFirst({
      where: {
        idUtilisateur: userId,
        estActif: true,
        OR: [
          { dateExpiration: null }, // Permanent ban
          { dateExpiration: { gte: new Date() } }, // Not expired yet
        ],
      },
    });

    if (!activeBan) {
      return { isBanned: false };
    }

    // Check if ban has expired
    if (activeBan.dateExpiration && activeBan.dateExpiration < new Date()) {
      // Auto-deactivate expired ban
      await prisma.ban.update({
        where: { idBan: activeBan.idBan },
        data: {
          estActif: false,
          dateDesactivation: new Date(),
        },
      });

      return { isBanned: false };
    }

    return { isBanned: true };
  } catch (error) {
    console.error("Error checking ban status:", error);
    return { isBanned: false };
  }
}

export const authOptions: NextAuthConfig = {
  providers: [
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
    
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.utilisateur.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashMotDePasse) {
          throw new Error("Identifiants invalides");
        }

        if (user.role !== credentials.role) {
          throw new Error("Accès interdit pour ce rôle");
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
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  
  callbacks: {
async signIn({ user, account, profile }) {
  if (account?.provider === "google") {
    try {
      const existingUser = await prisma.utilisateur.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        // ✅ USE TRANSACTION TO CREATE BOTH USER AND WORKER
        const result = await prisma.$transaction(async (tx) => {
          const newUser = await tx.utilisateur.create({
            data: {
              email: user.email!,
              nomComplet: user.name || (profile as { name?: string })?.name || "Google User",
              emailVerified: new Date(),
              role: "Travailleur",
              hashMotDePasse: null,
            },
          });

          // ✅ CREATE WORKER PROFILE (THIS WAS MISSING!)
          await tx.travailleur.create({
            data: {
              idUtilisateur: newUser.idUtilisateur,
              dateCreation: new Date(),
            },
          });

          return newUser;
        });
        
        (user as User).id = result.idUtilisateur;
        (user as User).role = result.role;
        
        console.log("Created new Google user with worker profile:", result.email);
      } else {
        // Update emailVerified if not set
        if (!existingUser.emailVerified) {
          await prisma.utilisateur.update({
            where: { email: user.email! },
            data: { emailVerified: new Date() },
          });
        }
        
        (user as User).id = existingUser.idUtilisateur;
        (user as User).role = existingUser.role;
      }
      
      return true;
    } catch (error) {
      console.error("Google sign-in error:", error);
      return false;
    }
  }

  return true;
},

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        
        // CHECK BAN STATUS ON EVERY SESSION CHECK
        const banStatus = await checkBanStatus(token.sub);
        
        if (banStatus.isBanned) {
          // Return null to invalidate session (forces logout)
          return null as any;
        }
        
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

    async jwt({ token, user, account }) {
      // On sign in
      if (user) {
        token.id = user.id;
        token.role = (user as User).role;
      }
      
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
    
    async redirect({ url, baseUrl }) {
      // Si l'URL contient un callbackUrl, l'utiliser
      if (url && url.startsWith(baseUrl)) {
        return url;
      }
      // Si l'URL contient /admin/sign-in, /enterprise/sign-in ou /worker/sign-in, l'utiliser
      if (url && (url.includes('/admin/sign-in') || url.includes('/enterprise/sign-in') || url.includes('/worker/sign-in'))) {
        return url;
      }
      // Par défaut, rediriger vers worker/dashboard (pour les nouvelles connexions)
      return `${baseUrl}/worker/dashboard`;
    },
  },
  
  pages: {
    signIn: "/worker/sign-in",
    error: "/worker/sign-in", 
  },
  
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  events: {
    async signOut() {
      // Optional: Log signout events
      console.log("User signed out");
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export const { GET, POST } = handlers;
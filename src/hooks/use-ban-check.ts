"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useBanCheck() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  // Store the user's role in a ref to persist it even when session becomes null
  const userRoleRef = useRef<string | null>(null);

  // Update the role ref whenever session changes
  useEffect(() => {
    if (session?.user?.role) {
      userRoleRef.current = session.user.role;
    }
  }, [session?.user?.role]);

  useEffect(() => {
    // Only check if user is authenticated
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    // Check ban status every 5 seconds
    const interval = setInterval(async () => {
      try {
        // Force session refresh to trigger the session callback
        const updatedSession = await update();
        
        // If session becomes null, user is banned
        if (!updatedSession || !updatedSession.user) {
          console.log("Ban detected - logging out");
          
          // Use the stored role from ref (before session was destroyed)
          const role = userRoleRef.current || session.user.role;
          let redirectUrl = "/worker/sign-in?banned=true";
          
          if (role === "Institution") {
            redirectUrl = "/enterprise/sign-in?banned=true";
          } else if (role === "Admin") {
            redirectUrl = "/admin/sign-in?banned=true";
          } else if (role === "Travailleur") {
            redirectUrl = "/worker/sign-in?banned=true";
          }
          
          console.log(`Redirecting ${role} to: ${redirectUrl}`);
          
          // Force sign out
          await signOut({ redirect: false });
          
          // Redirect to appropriate sign-in page
          router.push(redirectUrl);
          router.refresh();
        }
      } catch (error) {
        console.error("Ban check error:", error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [session, status, update, router]);
}
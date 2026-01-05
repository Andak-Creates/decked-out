import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      console.log("🔐 Initializing auth...");

      // Set maximum timeout for auth initialization
      const timeoutId = setTimeout(() => {
        console.error("⏰ Auth initialization timeout");
        setLoading(false);
      }, 5000); // 5 second timeout

      try {
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Session timeout")), 3000)
        );

        const {
          data: { session },
        } = await Promise.race([sessionPromise, timeoutPromise]).catch(
          (error) => {
            console.warn("Failed to get session:", error);
            return { data: { session: null } };
          }
        );

        console.log("✅ Session loaded:", !!session);
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        setSession(null);
        setUser(null);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        console.log("✅ Auth initialization complete");
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 Auth state changed:", _event);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      console.log("🧹 Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  // Tutorial check with timeout
  useEffect(() => {
    const checkTutorial = async () => {
      if (!user) {
        console.log("⚠️ No user, skipping tutorial check");
        return;
      }

      console.log("📚 Checking tutorial status...");

      try {
        // Check tutorial with timeout
        const tutorialPromise = supabase
          .from("profiles")
          .select("tutorial_completed")
          .eq("id", user.id)
          .single();

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tutorial check timeout")), 3000)
        );

        const { data } = await Promise.race([
          tutorialPromise,
          timeoutPromise,
        ]).catch((error) => {
          console.warn("Failed to check tutorial status:", error);
          return { data: null };
        });

        if (data && !data.tutorial_completed) {
          console.log("🎓 Tutorial not completed, redirecting...");
          router.replace("/tutorial");
        } else {
          console.log("✅ Tutorial completed or data unavailable");
        }
      } catch (error) {
        console.error("❌ Tutorial check error:", error);
        // Don't block the app if tutorial check fails
      }
    };

    if (!loading && user) {
      checkTutorial();
    }
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

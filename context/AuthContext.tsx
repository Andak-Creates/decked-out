import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

const TUTORIAL_COMPLETED_KEY = "@deckedOut:tutorialCompleted";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // 🔥 Listen for Firebase login/signup/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 Tutorial check — runs every time "user" changes
  useEffect(() => {
    const checkTutorial = async () => {
      // No user? do nothing
      if (!user) return;

      // Check if tutorial was completed
      const tutorialDone = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);

      // Not completed? Force user to do tutorial
      if (!tutorialDone) {
        router.replace("/tutorial");
      }
    };

    checkTutorial();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy access
export const useAuth = () => useContext(AuthContext);

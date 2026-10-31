import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export type AuthUser = User | {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
};

interface AuthContextType {
  user: AuthUser | null;
  googleFitToken: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("physiotwin_demo_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [googleFitToken, setGoogleFitToken] = useState<string | null>(() => {
    return localStorage.getItem("googleFitToken");
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedDemo = localStorage.getItem("physiotwin_demo_user");
    if (savedDemo) {
      try {
        setUser(JSON.parse(savedDemo));
        setLoading(false);
      } catch (e) {}
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem("physiotwin_demo_user");
      } else {
        const saved = localStorage.getItem("physiotwin_demo_user");
        if (saved) {
          try { setUser(JSON.parse(saved)); } catch (e) {}
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        setGoogleFitToken(credential.accessToken);
        localStorage.setItem("googleFitToken", credential.accessToken);
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Email login failed", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Email registration failed", error);
      throw error;
    }
  };

  const loginAsDemo = () => {
    const demoUser = {
      uid: "demo-athlete",
      email: "demo@physiotwin.local",
      displayName: "Demo Athlete",
    };
    setUser(demoUser);
    localStorage.setItem("physiotwin_demo_user", JSON.stringify(demoUser));
    setLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem("physiotwin_demo_user");
    try {
      await signOut(auth);
    } catch (e) {}
    setUser(null);
    setGoogleFitToken(null);
    localStorage.removeItem("googleFitToken");
  };

  return (
    <AuthContext.Provider value={{ user, googleFitToken, loading, loginWithGoogle, loginWithEmail, registerWithEmail, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

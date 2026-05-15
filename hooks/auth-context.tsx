import { useState, useEffect, createContext, useContext } from 'react';
import React from 'react';

// Simple storage wrapper
const storage = {
  getItem: async (key: string) => {
    try {
      // @ts-ignore
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (e) {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // @ts-ignore
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {}
  },
  removeItem: async (key: string) => {
    try {
      // @ts-ignore
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {}
  }
};

interface User {
  userId: string;
  userCode: string;
  userName: string;
  fullName: string;
  userGroupId: string;
  isWaiter: boolean;
  cardNumber: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (userData: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await storage.getItem('user');
      /* Temporarily disabled for testing
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      */
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (userData: User) => {
    setUser(userData);
    await storage.setItem('user', JSON.stringify(userData));
  };

  const signOut = async () => {
    setUser(null);
    await storage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

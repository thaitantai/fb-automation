"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  subscriptionPlan: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('fb_token');
      const userDataStr = localStorage.getItem('fb_user');
      
      if (token && userDataStr) {
        try {
          setUser(JSON.parse(userDataStr));
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('fb_token');
          localStorage.removeItem('fb_user');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('fb_token', token);
    localStorage.setItem('fb_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return { user, isAuthenticated, isLoading, login, logout };
}


import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'admin') => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string, role: 'student' | 'admin'): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      
      // For demo purposes, we'll accept any password for demo accounts
      if ((email === 'admin@demo.com' || email === 'student@demo.com') && password === 'password') {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error) {
          console.error('Login error:', error);
          return false;
        }

        if (userData) {
          const loggedInUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as 'student' | 'admin',
          };
          
          setUser(loggedInUser);
          localStorage.setItem('lms_user', JSON.stringify(loggedInUser));
          console.log('Login successful for user:', loggedInUser);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
    console.log('User logged out');
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting signup for:', email);
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        console.log('User already exists');
        return false;
      }

      // Create new user (in real app, password would be hashed)
      const { data: newUserData, error } = await supabase
        .from('users')
        .insert([
          {
            name,
            email,
            password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // Demo hash
            role: 'student'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Signup error:', error);
        return false;
      }

      if (newUserData) {
        const newUser: User = {
          id: newUserData.id,
          name: newUserData.name,
          email: newUserData.email,
          role: newUserData.role as 'student' | 'admin',
        };
        
        setUser(newUser);
        localStorage.setItem('lms_user', JSON.stringify(newUser));
        console.log('Signup successful for user:', newUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('lms_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('User restored from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('lms_user');
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

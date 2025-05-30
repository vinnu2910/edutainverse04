
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      
      // Fetch user from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !userData) {
        console.error('Login error - user not found:', error);
        return false;
      }

      // Verify password using bcrypt
      const passwordMatch = await bcrypt.compare(password, userData.password_hash);
      
      if (!passwordMatch) {
        console.error('Login error - password mismatch');
        return false;
      }

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
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError);
        return false;
      }

      if (existingUser) {
        console.log('User already exists with email:', email);
        return false;
      }

      // Hash password using bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      console.log('Creating new user with hashed password');

      // Create new user in database
      const { data: newUserData, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password_hash: hashedPassword,
            role: 'student'
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Signup error - failed to insert user:', insertError);
        return false;
      }

      if (newUserData) {
        console.log('User created successfully:', newUserData);
        
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
      
      console.error('No user data returned after insert');
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  // Check for existing user on mount and restore from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('lms_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify user still exists in database
          const { data: userData, error } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', parsedUser.id)
            .single();

          if (error || !userData) {
            console.log('Stored user no longer exists, clearing localStorage');
            localStorage.removeItem('lms_user');
          } else {
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role as 'student' | 'admin',
            });
            console.log('User restored from localStorage:', userData);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('lms_user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
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

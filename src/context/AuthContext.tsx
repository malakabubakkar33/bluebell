'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  role: 'customer' | 'admin';
  status: 'active' | 'suspended';
  created_at: string;
  orders_count?: number;
  total_spent?: number;
}

export interface RegisterInput {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  usersList: UserProfile[];
  login: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  adminUpdateUserRole: (userId: string, newRole: 'customer' | 'admin') => void;
  adminUpdateUserStatus: (userId: string, newStatus: 'active' | 'suspended') => void;
  adminDeleteUser: (userId: string) => void;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    name: 'Blue Bell Admin',
    email: 'admin@bluebells.pk',
    phone: '+92 300 1234567',
    whatsapp: '+92 300 1234567',
    role: 'admin',
    status: 'active',
    created_at: new Date().toISOString(),
    orders_count: 0,
    total_spent: 0,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>(DEFAULT_USERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user and usersList from localStorage on mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('bluebell_users_list_v3');
      if (storedUsers) {
        setUsersList(JSON.parse(storedUsers));
      } else {
        localStorage.setItem('bluebell_users_list_v3', JSON.stringify(DEFAULT_USERS));
        setUsersList(DEFAULT_USERS);
      }

      const activeUser = localStorage.getItem('bluebell_active_user');
      if (activeUser) {
        setUser(JSON.parse(activeUser));
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUsersList = (newList: UserProfile[]) => {
    setUsersList(newList);
    try {
      localStorage.setItem('bluebell_users_list_v3', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  // Login handler
  const login = async (email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // Smooth UX transition delay

    const trimmedEmail = email.trim().toLowerCase();

    // Check admin credentials
    if (
      (trimmedEmail === 'admin@bluebell.com' ||
        trimmedEmail === 'admin@bluebells.pk' ||
        trimmedEmail === 'admin') &&
      (password === 'admin123' || password === 'admin' || password === 'BlueBells@2026')
    ) {
      const adminUser: UserProfile = {
        id: 'user-admin-1',
        name: 'Admin',
        email: trimmedEmail.includes('@') ? trimmedEmail : 'admin@bluebells.pk',
        phone: '+92 300 1234567',
        whatsapp: '+92 300 1234567',
        role: 'admin',
        status: 'active',
        created_at: '2026-01-01T00:00:00.000Z',
        orders_count: 124,
        total_spent: 1248750,
      };
      setUser(adminUser);
      localStorage.setItem('bluebell_active_user', JSON.stringify(adminUser));
      setIsLoading(false);
      return { success: true, user: adminUser };
    }

    // Check existing customer accounts
    const existing = usersList.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!existing) {
      setIsLoading(false);
      return {
        success: false,
        error: 'No account found with this email. Please register your account first.',
      };
    }

    if (existing.status === 'suspended') {
      setIsLoading(false);
      return {
        success: false,
        error: 'Your account is suspended. Please contact store support.',
      };
    }

    setUser(existing);
    localStorage.setItem('bluebell_active_user', JSON.stringify(existing));
    setIsLoading(false);
    return { success: true, user: existing };
  };

  // Register handler (Name, Phone, WhatsApp, Email, Password)
  const register = async (data: RegisterInput): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const trimmedEmail = data.email.trim().toLowerCase();

    // Check if user already exists
    if (usersList.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      whatsapp: data.whatsapp.trim(),
      email: trimmedEmail,
      role: 'customer',
      status: 'active',
      created_at: new Date().toISOString(),
      orders_count: 0,
      total_spent: 0,
    };

    const updatedList = [newUser, ...usersList];
    saveUsersList(updatedList);
    setUser(newUser);
    localStorage.setItem('bluebell_active_user', JSON.stringify(newUser));

    setIsLoading(false);
    return { success: true, user: newUser };
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('bluebell_active_user');
    router.push('/');
  };

  // Update Profile
  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('bluebell_active_user', JSON.stringify(updated));

    const updatedList = usersList.map((u) => (u.id === user.id ? updated : u));
    saveUsersList(updatedList);
  };

  // Admin user management functions
  const adminUpdateUserRole = (userId: string, newRole: 'customer' | 'admin') => {
    const updatedList = usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    saveUsersList(updatedList);
    if (user && user.id === userId) {
      setUser({ ...user, role: newRole });
    }
  };

  const adminUpdateUserStatus = (userId: string, newStatus: 'active' | 'suspended') => {
    const updatedList = usersList.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    saveUsersList(updatedList);
  };

  const adminDeleteUser = (userId: string) => {
    const updatedList = usersList.filter((u) => u.id !== userId);
    saveUsersList(updatedList);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
        usersList,
        login,
        register,
        logout,
        updateProfile,
        adminUpdateUserRole,
        adminUpdateUserStatus,
        adminDeleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

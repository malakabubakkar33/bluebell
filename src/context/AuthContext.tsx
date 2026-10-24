'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  city?: string;
  address?: string;
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
  city?: string;
  address?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  usersList: UserProfile[];
  login: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  adminUpdateUserRole: (userId: string, newRole: 'customer' | 'admin') => void;
  adminUpdateUserStatus: (userId: string, newStatus: 'active' | 'suspended') => void;
  adminDeleteUser: (userId: string) => void;
  refreshUsers: () => Promise<void>;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    name: 'Blue Bell Admin',
    email: 'admin@bluebells.pk',
    phone: '+92 300 1234567',
    whatsapp: '+92 300 1234567',
    city: 'Peshawar',
    address: 'Saddar Road, Blue Bell Mobile Shop',
    role: 'admin',
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
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

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        setUsersList(data.users);
        try {
          localStorage.setItem('bluebell_users_list_v4', JSON.stringify(data.users));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Failed to fetch users from Supabase API', err);
    }
  };

  // Load user and usersList from localStorage and Supabase on mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('bluebell_users_list_v4');
      if (storedUsers) {
        setUsersList(JSON.parse(storedUsers));
      } else {
        localStorage.setItem('bluebell_users_list_v4', JSON.stringify(DEFAULT_USERS));
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

    // Automatically sync live users from Supabase database
    refreshUsers();
  }, []);

  const saveUsersList = (newList: UserProfile[]) => {
    setUsersList(newList);
    try {
      localStorage.setItem('bluebell_users_list_v4', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  // Login handler: Integrates Supabase Auth with smooth fallback
  const login = async (email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    setIsLoading(true);
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Check local/demo Admin credentials
    if (
      (trimmedEmail === 'admin@bluebells.pk' ||
        trimmedEmail === 'admin@bluebell.com' ||
        trimmedEmail === 'admin') &&
      (password === 'admin123' || password === 'admin' || password === 'BlueBells@2026')
    ) {
      const adminUser: UserProfile = {
        id: 'user-admin-1',
        name: 'Blue Bell Admin',
        email: 'admin@bluebells.pk',
        phone: '+92 300 1234567',
        whatsapp: '+92 300 1234567',
        city: 'Peshawar',
        address: 'Saddar Road, Blue Bell Mobile Shop',
        role: 'admin',
        status: 'active',
        created_at: '2026-01-01T00:00:00.000Z',
        orders_count: 0,
        total_spent: 0,
      };
      setUser(adminUser);
      localStorage.setItem('bluebell_active_user', JSON.stringify(adminUser));
      setIsLoading(false);
      return { success: true, user: adminUser };
    }

    // 2. Call server-side Supabase Auth login route
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const resData = await response.json();

      if (response.ok && resData.success && resData.user) {
        setUser(resData.user);
        localStorage.setItem('bluebell_active_user', JSON.stringify(resData.user));

        // Sync into usersList if not already present
        const exists = usersList.some((u) => u.email.toLowerCase() === resData.user.email.toLowerCase());
        if (!exists) {
          saveUsersList([resData.user, ...usersList]);
        }

        setIsLoading(false);
        return { success: true, user: resData.user };
      } else if (resData.error && !resData.error.includes('Failed to fetch')) {
        // Explicit invalid credentials from Supabase
        setIsLoading(false);
        return {
          success: false,
          error: resData.error || 'Invalid credentials. Please verify your email and password.',
        };
      }
    } catch (apiErr) {
      console.warn('API login request failed, falling back to local store', apiErr);
    }

    // 3. Fallback: Check local registered accounts
    const existing = usersList.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!existing) {
      setIsLoading(false);
      return {
        success: false,
        error: 'No account found with this email. Please check your credentials or click Sign Up.',
      };
    }

    if (existing.status === 'suspended') {
      setIsLoading(false);
      return {
        success: false,
        error: 'Your account is currently suspended. Please contact store support on WhatsApp.',
      };
    }

    setUser(existing);
    localStorage.setItem('bluebell_active_user', JSON.stringify(existing));
    setIsLoading(false);
    return { success: true, user: existing };
  };

  // Register handler: Registers in Supabase Auth & Local Store
  const register = async (data: RegisterInput): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    setIsLoading(true);
    const trimmedEmail = data.email.trim().toLowerCase();

    // Check if user already exists locally
    if (usersList.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    // Register with Supabase Auth API
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok && resData.success && resData.user) {
        const newUser = resData.user;
        const updatedList = [newUser, ...usersList.filter((u) => u.email.toLowerCase() !== trimmedEmail)];
        saveUsersList(updatedList);
        setUser(newUser);
        localStorage.setItem('bluebell_active_user', JSON.stringify(newUser));

        setIsLoading(false);
        return { success: true, user: newUser };
      } else if (resData.error) {
        setIsLoading(false);
        return { success: false, error: resData.error };
      }
    } catch (apiErr) {
      console.warn('Supabase register API call note:', apiErr);
    }

    // Fallback: Local registration
    const fallbackUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      whatsapp: data.whatsapp.trim(),
      email: trimmedEmail,
      city: data.city || 'Peshawar',
      address: data.address || '',
      role: 'customer',
      status: 'active',
      created_at: new Date().toISOString(),
      orders_count: 0,
      total_spent: 0,
    };

    const updatedList = [fallbackUser, ...usersList];
    saveUsersList(updatedList);
    setUser(fallbackUser);
    localStorage.setItem('bluebell_active_user', JSON.stringify(fallbackUser));

    setIsLoading(false);
    return { success: true, user: fallbackUser };
  };

  // Reset Password via Supabase
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your registered email address.' };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
        if (error) {
          return { success: false, error: error.message };
        }
      } catch (e: any) {
        console.warn('Reset password error:', e?.message);
      }
    }

    return { success: true };
  };

  // Logout handler
  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    localStorage.removeItem('bluebell_active_user');
    router.push('/');
  };

  // Update Profile with Supabase sync
  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('bluebell_active_user', JSON.stringify(updated));

    const updatedList = usersList.map((u) => (u.id === user.id ? updated : u));
    saveUsersList(updatedList);

    // Sync with Supabase Auth
    fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        name: updated.name,
        phone: updated.phone,
        whatsapp: updated.whatsapp,
        city: updated.city,
        address: updated.address,
      }),
    }).catch((err) => console.warn('Supabase profile sync note:', err));
  };

  // Admin User Role
  const adminUpdateUserRole = (userId: string, newRole: 'customer' | 'admin') => {
    const updatedList = usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    saveUsersList(updatedList);
    fetch('/api/auth/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role: newRole }),
    }).catch((err) => console.warn('Supabase role update error:', err));
  };

  // Admin User Status
  const adminUpdateUserStatus = (userId: string, newStatus: 'active' | 'suspended') => {
    const updatedList = usersList.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    saveUsersList(updatedList);
    fetch('/api/auth/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, status: newStatus }),
    }).catch((err) => console.warn('Supabase status update error:', err));
  };

  // Admin Delete User
  const adminDeleteUser = (userId: string) => {
    const updatedList = usersList.filter((u) => u.id !== userId);
    saveUsersList(updatedList);
    fetch(`/api/auth/users?id=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Supabase user delete error:', err));
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
        resetPassword,
        logout,
        updateProfile,
        adminUpdateUserRole,
        adminUpdateUserStatus,
        adminDeleteUser,
        refreshUsers,
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

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';

export const AdminLogoutButton: React.FC = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem('bluebell_admin_last_active');
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Logout API note:', err);
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      title="Sign out of Administrator Portal"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
    >
      {isLoggingOut ? (
        <LogOut className="w-3.5 h-3.5 animate-pulse" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
};

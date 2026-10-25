import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/adminGuard';
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell';

export const dynamic = 'force-dynamic';

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Authoritative server-side verification of admin session
  const session = await getAdminSession();

  if (!session.authenticated) {
    redirect('/admin/login');
  }

  if (!session.isAdmin || !session.user) {
    redirect('/admin/login?error=forbidden');
  }

  return <AdminLayoutShell user={session.user}>{children}</AdminLayoutShell>;
}

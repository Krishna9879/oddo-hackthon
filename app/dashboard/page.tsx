'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    
    // Route to role-specific dashboard
    switch (user.role) {
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'hr':
        router.push('/dashboard/hr');
        break;
      case 'payroll_officer':
        router.push('/dashboard/payroll-officer');
        break;
      case 'employee':
      default:
        router.push('/dashboard/employee');
        break;
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600" />
    </div>
  );
}

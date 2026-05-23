'use client';

import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/Toast';

export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <div className="sidebar-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </ToastProvider>
  );
}

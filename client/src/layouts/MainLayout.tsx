import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';

export function MainLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="border-b bg-white px-4 py-3 lg:px-6">
          <Breadcrumb />
        </div>
        <main className="flex-1 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
        <footer className="border-t bg-white px-6 py-4 text-xs text-muted-foreground">
          School Management System · Kenya · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

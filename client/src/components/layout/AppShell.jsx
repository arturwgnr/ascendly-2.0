import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import '../../styles/components/appshell.css';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-main">
        <Topbar onMenuClick={() => setSidebarOpen(s => !s)} />
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

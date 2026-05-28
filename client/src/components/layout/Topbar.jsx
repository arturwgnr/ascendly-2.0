import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/components/topbar.css';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/study':     'Study Tracker',
  '/growth':    'Personal Growth',
  '/tasks':     'Task Flow',
  '/journal':   'Journal',
  '/settings':  'Settings',
};

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const title = PAGE_TITLES[location.pathname] || 'Ascendly';

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <span className="topbar-title">{title}</span>
      </div>
      <div className="topbar-right">
        <ThemeToggle />
        <button className="topbar-action-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

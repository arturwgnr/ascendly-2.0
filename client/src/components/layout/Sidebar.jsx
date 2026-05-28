import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Target, CheckSquare, PenLine, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/components/sidebar.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/study',     label: 'Study',     icon: BookOpen },
  { path: '/growth',   label: 'Growth',    icon: Target },
  { path: '/tasks',    label: 'Tasks',     icon: CheckSquare },
  { path: '/journal',  label: 'Journal',   icon: PenLine },
  { path: '/settings', label: 'Settings',  icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function handleNav(path) {
    navigate(path);
    onClose?.();
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-symbol">ᨒ</span>
          <span className="sidebar-logo-name gradient-text">Ascendly</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              className={`sidebar-nav-item ${location.pathname === path ? 'active' : ''}`}
              onClick={() => handleNav(path)}
            >
              <Icon className="sidebar-nav-item-icon" size={16} strokeWidth={2} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : (user?.avatarInitials || '?')
              }
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div className="sidebar-user-name">{user?.displayName || 'User'}</div>
              <div className="sidebar-user-tier">Member</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

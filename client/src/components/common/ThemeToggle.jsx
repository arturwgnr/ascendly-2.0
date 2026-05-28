import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import '../../styles/components/topbar.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun
        size={16}
        className={`theme-toggle-icon ${theme === 'light' ? 'active' : 'entering'}`}
        style={{ position: 'absolute' }}
      />
      <Moon
        size={16}
        className={`theme-toggle-icon ${theme === 'dark' ? 'active' : 'entering'}`}
        style={{ position: 'absolute' }}
      />
    </button>
  );
}

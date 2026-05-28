import '../../styles/components/badge.css';

const priorityVariant = {
  Critical: 'danger',
  High: 'danger',
  Medium: 'warning',
  Low: 'info',
  CRITICAL: 'danger',
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'info',
};

export default function Badge({ children, variant, className = '' }) {
  const v = variant || priorityVariant[children] || 'muted';
  return (
    <span className={`badge badge-${v} ${className}`}>
      {children}
    </span>
  );
}

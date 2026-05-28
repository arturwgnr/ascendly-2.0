import '../../styles/components/button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="spinner spinner-sm" />
      ) : Icon ? (
        <Icon size={14} strokeWidth={2} />
      ) : null}
      {children}
    </button>
  );
}

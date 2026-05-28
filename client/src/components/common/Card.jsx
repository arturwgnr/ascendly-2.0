import '../../styles/components/card.css';

export default function Card({ children, className = '', title, subtitle, icon: Icon, glass = false }) {
  return (
    <div className={`card ${glass ? 'card-glass' : ''} ${className}`}>
      {(title || Icon) && (
        <div className="card-header">
          <div className="card-header-left">
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {Icon && <Icon className="card-icon" />}
        </div>
      )}
      {children}
    </div>
  );
}

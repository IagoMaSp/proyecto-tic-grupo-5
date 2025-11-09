// frontend/src/components/auth/AuthBranding.tsx

interface AuthBrandingProps {
  title: string;
  description: string;
  features?: Array<{
    icon: string;
    text: string;
  }>;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

export default function AuthBranding({ 
  title, 
  description, 
  features, 
  stats 
}: AuthBrandingProps) {
  return (
    <div className="auth-brand">
      <div className="brand-content">
        <div className="brand-logo">
          <div className="logo-circle">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
        <h2 className="brand-title">{title}</h2>
        <p className="brand-desc">{description}</p>
        
        {features && (
          <div className="brand-features">
            {features.map((feature, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-text">{feature.text}</div>
              </div>
            ))}
          </div>
        )}
        
        {stats && (
          <div className="brand-stats">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <div className="stat-value-auth">{stat.value}</div>
                <div className="stat-label-auth">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
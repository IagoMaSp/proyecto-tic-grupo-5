// frontend/src/components/navbar/UserMenu.tsx

interface User {
  id: number;
  username: string;
  profile: {
    profile_photo_url: string | null;
  };
}

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  return (
    <div className="user-menu">
      <div className="user-info">
        {user.profile.profile_photo_url ? (
          <img 
            src={user.profile.profile_photo_url} 
            alt={user.username}
            className="user-avatar"
          />
        ) : (
          <div className="user-avatar-placeholder">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="user-name">{user.username}</span>
      </div>
      
      <button onClick={onLogout} className="btn-logout">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Salir
      </button>
    </div>
  );
}
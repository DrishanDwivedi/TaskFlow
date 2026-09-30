import React from 'react';

export const Navbar = ({ user, onLogout, onOpenAuth }) => {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">TF</div>
        <span>TaskFlow</span>
      </div>

      <div className="navbar-user">
        {user ? (
          <>
            <div className="user-badge">
              <div className="avatar-circle">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span>{user.username}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onOpenAuth('login')}>
              Login
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth('register')}>
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

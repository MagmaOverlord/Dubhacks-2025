//Header

import React from 'react';
import { Refrigerator, LogOut, User } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Refrigerator size={28} />
          <h1>Digital Fridge</h1>
        </div>
        {user && (
          <div className="header-right">
            <div className="user-info">
              <User size={20} />
              <span>{user.name}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

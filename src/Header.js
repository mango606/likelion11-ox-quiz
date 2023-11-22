import React from 'react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

function Header({ user }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <header>
      <h1>OX 퀴즈</h1>
      {user && (
        <button onClick={handleLogout}>로그아웃</button>
      )}
    </header>
  );
}

export default Header;
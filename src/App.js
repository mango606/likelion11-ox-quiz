import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './Login';
import Admin from './Admin';
import UserInterface from './UserInterface';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // 사용자가 로그인한 경우
        setUser(user);
        // 관리자 이메일 체크
        setIsAdmin(user.email === 'handmj01@gmail.com');
      } else {
        // 사용자가 로그아웃한 경우
        setUser(null);
        setIsAdmin(false);
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <div>
      <h1>OX 퀴즈</h1>
      {user ? (
        <>
          <button onClick={handleLogout}>로그아웃</button>
          {isAdmin ? (
            <Admin />
          ) : (
            <UserInterface />
          )}
        </>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
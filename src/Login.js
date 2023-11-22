// Login.js
import React, { useState } from 'react';
import { auth, firestore } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // 사용자 이름 상태 추가

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Firebase Authentication을 사용하여 사용자를 생성합니다.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Firestore에 사용자 정보를 저장합니다.
      const user = userCredential.user;
      await setDoc(doc(firestore, "users", user.uid), {
        name: name,
        email: email
      });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        // 이미 사용자가 존재하는 경우 로그인을 시도합니다.
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (loginError) {
          alert(loginError.message);
        }
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
        />
        <button type="submit">로그인 / 회원가입</button>
      </form>
    </div>
  );
}

export default Login;
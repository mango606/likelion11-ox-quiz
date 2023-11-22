import React, { useState, useEffect } from 'react';
import { firestore } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';

function Admin() {
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [quizType, setQuizType] = useState('ox');

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(firestore, "questions"));
      setQuestions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(firestore, "users"));
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  const addNewQuestion = async () => {
    if (newQuestionContent) {
      await addDoc(collection(firestore, "questions"), {
        content: newQuestionContent,
        type: quizType,
        isActive: false
      });
      setNewQuestionContent('');
    }
  };

  const toggleQuestionActive = async (questionId, isActive) => {
    const questionRef = doc(firestore, "questions", questionId);
    await updateDoc(questionRef, { isActive: !isActive });
  };

  const setUserParticipation = async (userId, canParticipate) => {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, { canParticipate: !canParticipate });
  };

  const revealAnswer = async (questionId, answer) => {
    const questionRef = doc(firestore, "questions", questionId);
    await updateDoc(questionRef, { answerRevealed: true, answer: answer });
  };

  const hideAnswer = async (questionId) => {
    const questionRef = doc(firestore, "questions", questionId);
    await updateDoc(questionRef, { answerRevealed: false });
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={newQuestionContent}
          onChange={(e) => setNewQuestionContent(e.target.value)}
          placeholder="새로운 질문 입력"
        />
        <select value={quizType} onChange={(e) => setQuizType(e.target.value)}>
          <option value="ox">OX 퀴즈</option>
          <option value="subjective">주관식 퀴즈</option>
          <option value="bonus">보너스 퀴즈</option>
        </select>
        <button onClick={addNewQuestion}>질문 추가</button>
      </div>

      <div>
        <h2>질문 목록</h2>
        {questions.map(question => (
          <div key={question.id}>
            <p>{question.content}</p>
            <button onClick={() => toggleQuestionActive(question.id, question.isActive)}>
              {question.isActive ? '비활성화' : '활성화'}
            </button>
            {question.isActive && (
              <button onClick={() => revealAnswer(question.id, question.answer)}>
                정답 공개
              </button>
            )}
            {question.answerRevealed && (
              <button onClick={() => hideAnswer(question.id)}>
                정답 공개 취소
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <h2>사용자 목록</h2>
        {users.map(user => (
          <div key={user.id}>
            <p>{user.name} ({user.email})</p>
            <button onClick={() => setUserParticipation(user.id, user.canParticipate)}>
              {user.canParticipate ? '참여 금지' : '참여 허용'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
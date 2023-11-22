import React, { useState, useEffect } from 'react';
import { firestore, auth } from './firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    // 현재 활성화된 질문을 실시간으로 가져옵니다.
    const q = query(collection(firestore, "questions"), where("isActive", "==", true));
    const unsubscribeQuestion = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const activeQuestion = querySnapshot.docs[0].data();
        setCurrentQuestion({ id: querySnapshot.docs[0].id, ...activeQuestion });
      } else {
        setCurrentQuestion(null);
      }
    });

    return () => {
      unsubscribeQuestion();
    };
  }, []);

  useEffect(() => {
    if (currentQuestion) {
      // 현재 질문에 대한 응답을 실시간으로 가져옵니다.
      const responseQuery = query(
        collection(firestore, "responses"),
        where("questionId", "==", currentQuestion.id)
      );
      const unsubscribeResponse = onSnapshot(responseQuery, (querySnapshot) => {
        const newResponses = querySnapshot.docs.map(doc => doc.data());
        setResponses(newResponses);
      });

      return () => {
        unsubscribeResponse();
      };
    }
  }, [currentQuestion]);

  const handleSubmitResponse = async (response) => {
    // 사용자 응답을 Firestore에 저장합니다.
    if (currentQuestion && auth.currentUser) {
      try {
        await addDoc(collection(firestore, "responses"), {
          userId: auth.currentUser.uid,
          questionId: currentQuestion.id,
          response: response,
          timestamp: new Date()
        });
      } catch (error) {
        console.error("응답 저장 오류:", error);
        alert('응답 저장에 실패했습니다.');
      }
    }
  };

  // 응답 통계 계산
  const responseStats = responses.reduce(
    (stats, response) => {
      if (response.response) {
        stats.trueCount += 1;
      } else {
        stats.falseCount += 1;
      }
      return stats;
    },
    { trueCount: 0, falseCount: 0 }
  );

  return (
    <div>
      {currentQuestion ? (
        <div>
          <p>{currentQuestion.content}</p>
          <button onClick={() => handleSubmitResponse(true)}>O</button>
          <button onClick={() => handleSubmitResponse(false)}>X</button>
        </div>
      ) : (
        <p>활성화된 질문이 없습니다.</p>
      )}
      <div>
        <p>O 응답: {responseStats.trueCount}</p>
        <p>X 응답: {responseStats.falseCount}</p>
      </div>
    </div>
  );
}

export default Quiz;
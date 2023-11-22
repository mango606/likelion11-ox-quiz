import React, { useState, useEffect } from 'react';
import { firestore, auth } from './firebase';
import { collection, query, where, onSnapshot, addDoc, doc, getDocs } from 'firebase/firestore';

function UserInterface() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [correctUsers, setCorrectUsers] = useState([]);

  useEffect(() => {
    // 현재 활성화된 질문을 실시간으로 가져옵니다.
    const q = query(collection(firestore, "questions"), where("isActive", "==", true));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const activeQuestion = querySnapshot.docs[0].data();
        setCurrentQuestion({ id: querySnapshot.docs[0].id, ...activeQuestion });
        setHasResponded(false);
        setAnswerRevealed(false); // 여기에서 answerRevealed 초기화
      } else {
        setCurrentQuestion(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 정답 공개 상태 확인
    if (currentQuestion && hasResponded) { // 사용자가 응답한 후에만 확인
      const questionRef = doc(firestore, "questions", currentQuestion.id);
      onSnapshot(questionRef, (doc) => {
        const questionData = doc.data();
        if (questionData.answerRevealed) {
          setAnswerRevealed(true);
          // 정답을 맞춘 사용자 목록 가져오기
          const responsesRef = collection(firestore, "responses");
          const q = query(responsesRef, where("questionId", "==", currentQuestion.id), where("isCorrect", "==", true));
          getDocs(q).then((querySnapshot) => {
            const users = querySnapshot.docs.map(doc => doc.data().userName);
            setCorrectUsers(users);
          });
        }
      });
    }
  }, [currentQuestion, hasResponded]);

  const handleSubmitResponse = async (response) => {
    if (currentQuestion && auth.currentUser && !hasResponded) {
      try {
        await addDoc(collection(firestore, "responses"), {
          userId: auth.currentUser.uid,
          questionId: currentQuestion.id,
          response: response,
          timestamp: new Date()
        });
        setHasResponded(true); // 사용자가 응답함을 표시
      } catch (error) {
        console.error("응답 저장 오류:", error);
      }
    }
  };

  return (
    <div>
      {currentQuestion ? (
        <div>
          <p>{currentQuestion.content}</p>
          {!answerRevealed ? (
            <>
              {currentQuestion.type === 'ox' && (
                <>
                  <button onClick={() => handleSubmitResponse(true)} disabled={hasResponded}>O</button>
                  <button onClick={() => handleSubmitResponse(false)} disabled={hasResponded}>X</button>
                </>
              )}
              {currentQuestion.type === 'subjective' && (
                <input type="text" placeholder="정답을 입력하세요" disabled={hasResponded} />
              )}
              {/* 보너스 퀴즈는 입력 필드 없음 */}
            </>
          ) : (
            <div>
              <p>정답: {currentQuestion.answer}</p>
              <p>정답을 맞춘 사용자: {correctUsers.join(", ")}</p>
            </div>
          )}
        </div>
      ) : (
        <p>현재 활성화된 질문이 없습니다.</p>
      )}
    </div>
  );
}

export default UserInterface;
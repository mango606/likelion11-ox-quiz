// Firebase v9+ 모듈화된 임포트 방식
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAthhr3LxoD-DlAwLBL5vWeeuM2q17ASvQ",
    authDomain: "ox-quiz-adccb.firebaseapp.com",
    projectId: "ox-quiz-adccb",
    storageBucket: "ox-quiz-adccb.appspot.com",
    messagingSenderId: "132464206996",
    appId: "1:132464206996:web:122c4ec3f18cf28c738081",
    measurementId: "G-PFE303EHTX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
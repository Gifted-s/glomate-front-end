import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2lSG1FbXK3Q675GaLL_pM5t8zWsBMhiM",
  authDomain: "helpful-5daf9.firebaseapp.com",
  projectId: "helpful-5daf9",
  storageBucket: "helpful-5daf9.appspot.com",
  messagingSenderId: "950605836723",
  appId: "1:950605836723:web:2883fbe111f86a03439bc6",
  measurementId: "G-1MCQK0NSGR"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebase);
console.log(firebase.name, "firebase connected")
export default firebase
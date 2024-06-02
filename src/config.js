import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsbk58v7s7ty-lhQFs_2k7sOHG6CezY2Y",
  authDomain: "ai-fitness-guru-8e733.firebaseapp.com",
  projectId: "ai-fitness-guru-8e733",
  storageBucket: "ai-fitness-guru-8e733.appspot.com",
  messagingSenderId: "333799841273",
  appId: "1:333799841273:web:ad5d169765862042fdb128",
  measurementId: "G-N2T4MX69J6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {auth, provider};
// const analytics = getAnalytics(app);
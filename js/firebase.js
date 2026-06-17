// Import oficjalnych bibliotek Firebase prosto z serwerów Google (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Twoja konfiguracja aplikacji webowej Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA3R5dSooAR8kDxNdRr80S8SqFEEns2CPs",
  authDomain: "helpdesk-pro-f4220.firebaseapp.com",
  projectId: "helpdesk-pro-f4220",
  storageBucket: "helpdesk-pro-f4220.firebasestorage.app",
  messagingSenderId: "650714697239",
  appId: "1:650714697239:web:cba1fcd423f146060a9652",
  measurementId: "G-4LSFYMWS3W"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicjalizacja i eksport usług dla reszty aplikacji
export const db = getFirestore(app);
export const auth = getAuth(app);
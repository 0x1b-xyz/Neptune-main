import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome/css/font-awesome.css';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDg175AidURF6LpgHYZS3J8SQPVhn8dORc",
  authDomain: "senior-project-41ab5.firebaseapp.com",
  projectId: "senior-project-41ab5",
  storageBucket: "senior-project-41ab5.appspot.com",
  messagingSenderId: "98340510353",
  appId: "1:98340510353:web:19e8dbed8353b10275bd30",
  measurementId: "G-11LW7159TZ"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

createApp(App).provide('auth', auth).mount('#app');

export { auth };

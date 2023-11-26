import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome/css/font-awesome.css';
import firebase from 'firebase/compat/app';
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDg175AidURF6LpgHYZS3J8SQPVhn8dORc",
  authDomain: "senior-project-41ab5.firebaseapp.com",
  databaseURL: "https://senior-project-41ab5-default-rtdb.firebaseio.com",
  projectId: "senior-project-41ab5",
  storageBucket: "senior-project-41ab5.appspot.com",
  messagingSenderId: "98340510353",
  appId: "1:98340510353:web:19e8dbed8353b10275bd30",
  measurementId: "G-11LW7159TZ"
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Create a Firestore instance
const firestore = firebaseApp.firestore();

const vueApp = createApp(App)

// Make Firestore available globally within Vue app
vueApp.config.globalProperties.$firebase = {
  auth,
  firestore,
};

vueApp.provide('auth', auth).mount('#app');
vueApp.provide('$firestore', firestore)

export default vueApp;

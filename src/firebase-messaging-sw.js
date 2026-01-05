// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyA9MYtyyfezvFco_-vJ80rg1Qv_qk1eHcQ",
  authDomain: "iglesiatechapp.firebaseapp.com",
  databaseURL: "https://iglesiatechapp.firebaseio.com",
  projectId: "iglesiatechapp",
  storageBucket: "iglesiatechapp.appspot.com",
  messagingSenderId: "727159322563",
  appId: "1:727159322563:web:e5b8324e8ad47c5790ef76"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

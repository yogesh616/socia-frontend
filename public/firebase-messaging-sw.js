importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyDabGdECSq6wqQiyvYuUw8gJPj2-iO-JxE",
  authDomain: "askmate-519af.firebaseapp.com",
  projectId: "askmate-519af",
  storageBucket: "askmate-519af.firebasestorage.app",
  messagingSenderId: "809540334079",
  appId: "1:809540334079:web:2ae83777f9dafb86b8f7ca"
};


firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
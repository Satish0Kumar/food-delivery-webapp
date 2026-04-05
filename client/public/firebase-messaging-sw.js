importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            'AIzaSyDXn1hlJNENlKBzjdXZtJjGAprokXq7nGY',
  authDomain:        'food-delivery-app-46bc8.firebaseapp.com',
  projectId:         'food-delivery-app-46bc8',
  storageBucket:     'food-delivery-app-46bc8.firebasestorage.app',
  messagingSenderId: '501695287724',
  appId:             '1:501695287724:web:2f87f7f93b5fc07373ea09',
})

const messaging = firebase.messaging()

// Handle background messages (when tab is not in focus)
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.svg',
  })
})

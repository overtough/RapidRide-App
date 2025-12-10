// Firebase Configuration
// Replace these values with your Firebase project config
// Get from: Firebase Console > Project Settings > Your apps > Web app

const firebaseConfig = {
  apiKey: "AIzaSyDs52r7Beg9ba-pSuZap_Z7O3D2iJ6cKh0",
  authDomain: "rapidrideonline.firebaseapp.com",
  projectId: "rapidrideonline",
  storageBucket: "rapidrideonline.firebasestorage.app",
  messagingSenderId: "1077866652324",
  appId: "1:1077866652324:web:fae403c5f027f9ce1d3c31",
  measurementId: "G-TC9THBL1FQ"
};

// Initialize Firebase
let auth = null;
let isConfigured = false;

try {
  if (typeof firebase !== 'undefined') {
    // Check if config is filled in
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
      firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      
      // Set persistence to LOCAL (survives browser restart)
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
          console.log('✅ Firebase initialized with LOCAL persistence');
        })
        .catch((error) => {
          console.error('⚠️ Firebase persistence error:', error);
        });
      
      isConfigured = true;
    } else {
      console.warn('⚠️ Firebase not configured. Please update firebase-config.js');
    }
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseConfigured = isConfigured;

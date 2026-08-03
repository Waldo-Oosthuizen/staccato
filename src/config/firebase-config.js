import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA72hBNmeeZNWsDVFsS6eVU0vM47NUA5OY',
  authDomain: 'fretnot-attendance-b3026.firebaseapp.com',
  projectId: 'fretnot-attendance-b3026',
  storageBucket: 'fretnot-attendance-b3026.appspot.com',
  messagingSenderId: '1068497148466',
  appId: '1:1068497148466:web:538e53b89fc500b9ce3a2b',
};

const app = initializeApp(firebaseConfig);
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY;

if (appCheckSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

const auth = getAuth(app);
void setPersistence(auth, browserLocalPersistence).catch(() => {});

const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'

// Types define kar rahe hain taaki errors na aayein
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
}

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

class AuthService {
  
  // Login Function - Ab ye Direct Firebase se baat karega
  async login(username: string, password: string, userType: 'admin' | 'student') {
    try {
      console.log("Attempting login via Firebase directly...");
      
      // 1. Firebase se login karo
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const user = userCredential.user;

      // 2. Token generate karo
      const token = await user.getIdToken();

      // 3. Store ke liye Fake Response return karo
      // (Kyunki backend abhi ready nahi hai, hum frontend ko batayenge ki sab okay hai)
      return {
        user: {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || username.split('@')[0], // Email ka pehla hissa naam bana diya
          role: userType // Jo tumne select kiya wahi role maan liya jayega
        },
        sessionId: 'offline-session-' + Date.now(),
        token: token
      };

    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Check auth status
  isAuthenticated(): boolean {
    return auth.currentUser !== null
  }

  // Get current Firebase user
  getCurrentFirebaseUser() {
    return auth.currentUser
  }
}

export const authService = new AuthService()

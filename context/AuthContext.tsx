
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db, rtdb } from '../services/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserSnapshot: (() => void) | undefined;

    const unsubscribeAuthState = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      // If there's an existing user snapshot listener, unsubscribe from it
      if (unsubscribeUserSnapshot) {
        unsubscribeUserSnapshot();
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for real-time updates on the user document
        unsubscribeUserSnapshot = onSnapshot(userRef, async (userSnap) => {
          if (userSnap.exists()) {
            setUser(userSnap.data() as User);
          } else {
            // Create a new user document if it doesn't exist (e.g., for social logins)
            const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: 'user', // Default role
                bookmarkedArticles: [],
            };
            // Save to Firestore
            await setDoc(userRef, newUser);
            
            // Also save to Realtime Database
            const rtdbUserRef = ref(rtdb, 'users/' + firebaseUser.uid);
            await set(rtdbUserRef, newUser);

            setUser(newUser);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user document:", error);
          setUser(null);
          setLoading(false);
        });

      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuthState();
      if (unsubscribeUserSnapshot) {
        unsubscribeUserSnapshot();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

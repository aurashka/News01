
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, AuthProvider as FirebaseAuthProvider } from 'firebase/auth';
import { auth, db, rtdb, googleProvider, appleProvider } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { useSettings } from '../context/SettingsContext';
import { GoogleIcon, AppleIcon } from '../components/Icons';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { settings } = useSettings();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      // Create a user object to save
      const userData = {
        uid: userCredential.user.uid,
        displayName: name,
        email: email,
        photoURL: null,
        bookmarkedArticles: [],
        role: 'user',
      };

      // Create a user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Save user data to Firebase Realtime Database
      await set(ref(rtdb, 'users/' + userCredential.user.uid), userData);

      navigate('/home'); // Navigate to home after signup
    } catch (err: any) {
      setError('Failed to create an account. The email might already be in use.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: FirebaseAuthProvider) => {
    setError('');
    try {
      await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (err: any) {
      setError('Failed to sign up. Please try again.');
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-lightbg dark:bg-darkbg flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-lightcard dark:bg-darkcard rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-lighttext dark:text-darktext mb-2">Create Account</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Start your news journey</p>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lighttext dark:text-darktext"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lighttext dark:text-darktext"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lighttext dark:text-darktext"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {(settings.showGoogleLogin || settings.showAppleLogin) && (
          <>
            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">Or sign up with</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="flex flex-col space-y-3">
              {settings.showGoogleLogin && (
                <button onClick={() => handleSocialLogin(googleProvider)} className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <GoogleIcon className="w-5 h-5 mr-3" />
                  <span className="font-semibold text-sm">Sign up with Google</span>
                </button>
              )}
              {settings.showAppleLogin && (
                 <button onClick={() => handleSocialLogin(appleProvider)} className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <AppleIcon className="w-5 h-5 mr-3" />
                  <span className="font-semibold text-sm">Sign up with Apple</span>
                </button>
              )}
            </div>
          </>
        )}
        
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, AuthProvider as FirebaseAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider } from '../services/firebase';
import { useSettings } from '../context/SettingsContext';
import { GoogleIcon, AppleIcon } from '../components/Icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/home';
  const { settings } = useSettings();

  const handleSuccessfulLogin = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data()?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Special check for hardcoded admin user after successful authentication
      if (userCredential.user.email === 'news06@gmail.com') {
          navigate('/admin', { replace: true });
      } else {
          // Regular role-based redirect for other users
          await handleSuccessfulLogin(userCredential.user);
      }
    } catch (err: any) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: FirebaseAuthProvider) => {
    setError('');
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleSuccessfulLogin(userCredential.user);
    } catch (err: any) {
      setError('Failed to sign in. Please try again.');
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-lightbg dark:bg-darkbg flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-lightcard dark:bg-darkcard rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-lighttext dark:text-darktext mb-2">Welcome Back!</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Log in to your account</p>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-6">
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {(settings.showGoogleLogin || settings.showAppleLogin) && (
          <>
            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">Or continue with</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="flex flex-col space-y-3">
              {settings.showGoogleLogin && (
                <button onClick={() => handleSocialLogin(googleProvider)} className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <GoogleIcon className="w-5 h-5 mr-3" />
                  <span className="font-semibold text-sm">Sign in with Google</span>
                </button>
              )}
              {settings.showAppleLogin && (
                 <button onClick={() => handleSocialLogin(appleProvider)} className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <AppleIcon className="w-5 h-5 mr-3" />
                  <span className="font-semibold text-sm">Sign in with Apple</span>
                </button>
              )}
            </div>
          </>
        )}
        
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
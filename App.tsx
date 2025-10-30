
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import Article from './pages/Article';
import Layout from './components/Layout';
import Spinner from './components/Spinner';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageArticles from './pages/admin/ManageArticles';
import ManageCategories from './pages/admin/ManageCategories';
import ManageSettings from './pages/admin/ManageSettings';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-lightbg dark:bg-darkbg"><Spinner /></div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
};

const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-lightbg dark:bg-darkbg"><Spinner /></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (user.role !== 'admin') {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
};

const InitialRouteHandler: React.FC = () => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        return <Navigate to="/onboarding" replace />;
    }
    // Default to /home for existing users
    return <Navigate to="/home" replace />;
};


const AppRoutes: React.FC = () => {
    const { theme } = useTheme();

    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <HashRouter>
            <Routes>
                {/* Standalone pages */}
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Public pages with Layout */}
                <Route path="/home" element={<Layout><Home /></Layout>} />
                <Route path="/discover" element={<Layout><Discover /></Layout>} />
                
                {/* Public article page, bookmarking is handled internally */}
                <Route path="/article/:id" element={<Article />} />

                {/* Protected Pages */}
                <Route path="/bookmarks" element={<ProtectedRoute><Layout><Bookmarks /></Layout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

                {/* Admin Pages */}
                <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
                <Route path="/admin/articles" element={<AdminRoute><AdminLayout><ManageArticles /></AdminLayout></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><AdminLayout><ManageCategories /></AdminLayout></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminLayout><ManageSettings /></AdminLayout></AdminRoute>} />
                
                {/* Entry and redirects */}
                <Route path="/" element={<InitialRouteHandler />} />
                <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
        </HashRouter>
    );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;

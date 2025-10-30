import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BellIcon, UserIcon as ProfileIcon, BookmarkIcon, SettingsIcon as AppSettingsIcon } from '../components/Icons'; // Renamed UserIcon to avoid conflict

// Simple icon components for Profile options
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

const AdminIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const ProfileOption = ({ icon: Icon, text, onClick, hasToggle, children }: { icon: React.ElementType, text: string, onClick?: () => void, hasToggle?: boolean, children?: React.ReactNode }) => (
    <div onClick={onClick} className={`flex items-center p-3 rounded-lg transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-darkcard/60' : ''}`}>
        <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Icon className="w-5 h-5" />
        </div>
        <span className="font-semibold ml-4 flex-1">{text}</span>
        {hasToggle ? children : <ChevronRightIcon className="w-5 h-5 text-graytext" />}
    </div>
  );

  return (
    <div className="p-4 space-y-8 pb-24">
      <h1 className="text-3xl font-bold text-center">Profile</h1>
      
      <div className="flex flex-col items-center space-y-2">
        <img
          src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-darkcard shadow-lg"
        />
        <h2 className="text-xl font-bold mt-2">{user?.displayName || 'News Enthusiast'}</h2>
        <p className="text-graytext">{user?.email}</p>
      </div>

      <div className="space-y-2">
         <ProfileOption icon={ProfileIcon} text="Edit Profile" onClick={() => {}} />
         <ProfileOption icon={BookmarkIcon} text="Bookmarks" onClick={() => navigate('/bookmarks')} />
         <ProfileOption icon={BellIcon} text="Notifications" onClick={() => {}} />
         {user?.role === 'admin' && (
            <ProfileOption icon={AdminIcon} text="Admin Panel" onClick={() => navigate('/admin')} />
         )}
         <ProfileOption icon={SettingsIcon} text="Dark Mode" hasToggle>
            <button onClick={toggleTheme} className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-600 focus:outline-none">
              <span className={`${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
              />
            </button>
         </ProfileOption>
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-red-100 dark:bg-red-900/30 text-primary font-bold py-3 px-4 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition duration-300"
      >
        Log Out
      </button>
    </div>
  );
};

export default Profile;

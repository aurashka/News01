
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CompassIcon, BookmarkIcon, UserIcon, HomeIconFilled, CompassIconFilled, BookmarkIconFilled, UserIconFilled } from './Icons';

const BottomNav: React.FC = () => {
  const navItems = [
    { path: '/home', icon: HomeIcon, filledIcon: HomeIconFilled, label: 'Home' },
    { path: '/discover', icon: CompassIcon, filledIcon: CompassIconFilled, label: 'Discover' },
    { path: '/bookmarks', icon: BookmarkIcon, filledIcon: BookmarkIconFilled, label: 'Bookmarks' },
    { path: '/profile', icon: UserIcon, filledIcon: UserIconFilled, label: 'Profile' },
  ];

  const activeLinkClass = 'text-primary';
  const inactiveLinkClass = 'text-gray-400 dark:text-gray-500';

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-lightcard dark:bg-darkcard border-t border-gray-200 dark:border-gray-700 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-1px_10px_rgba(0,0,0,0.2)] z-10">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => 
                `flex flex-col items-center justify-center transition-colors duration-200 w-16 ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            {({ isActive }) => (
                <>
                    {isActive ? <item.filledIcon className="w-6 h-6 mb-1" /> : <item.icon className="w-6 h-6 mb-1" />}
                    <span className="text-xs font-medium">{item.label}</span>
                </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

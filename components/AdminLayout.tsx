
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, BackIcon } from './Icons'; // Assuming BackIcon is in Icons.tsx

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const navItems = [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/articles', label: 'Articles' },
        { path: '/admin/categories', label: 'Categories' },
        { path: '/admin/settings', label: 'Settings' },
    ];
    
    const activeLinkClass = 'bg-primary text-white';
    const inactiveLinkClass = 'text-lighttext dark:text-darktext hover:bg-gray-200 dark:hover:bg-darkcard';

    return (
        <div className="flex flex-col h-screen font-sans bg-lightbg dark:bg-darkbg">
            <header className="flex items-center justify-between p-4 bg-lightcard dark:bg-darkcard shadow-md">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/profile')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-darkbg">
                        <BackIcon className="w-6 h-6 text-lighttext dark:text-darktext" />
                    </button>
                    <h1 className="text-xl font-bold text-lighttext dark:text-darktext">Admin Panel</h1>
                </div>
                <button onClick={() => navigate('/home')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-darkbg">
                    <HomeIcon className="w-6 h-6 text-lighttext dark:text-darktext" />
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <nav className="w-56 bg-lightcard dark:bg-darkcard p-4 space-y-2 hidden md:block">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            className={({ isActive }) => 
                                `block px-4 py-2 rounded-lg font-semibold transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <main className="flex-1 p-6 overflow-y-auto pb-20 md:pb-6">
                    {children}
                </main>
            </div>
            
            {/* Bottom Nav for Mobile Admin */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-lightcard dark:bg-darkcard border-t border-gray-200 dark:border-gray-700 z-10">
                <div className="flex justify-around items-center h-full">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            className={({ isActive }) => 
                                `text-xs text-center font-medium px-2 py-1 rounded-md ${isActive ? activeLinkClass : inactiveLinkClass}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default AdminLayout;

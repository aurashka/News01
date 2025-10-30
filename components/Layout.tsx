
import React from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex flex-col font-sans text-lighttext dark:text-darktext bg-lightbg dark:bg-darkbg">
      <main className="flex-1 overflow-y-auto overscroll-contain">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;

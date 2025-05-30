
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  isPublic?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isPublic = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30">
      <Navbar isPublic={isPublic} />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

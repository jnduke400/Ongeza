import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import PinSetupBadge from './PinSetupBadge';
import TwoFactorAuthBadge from './TwoFactorAuthBadge';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsMobileMenuOpen(false); // Close mobile menu if we resize to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainContentPadding = isMobile ? 'pl-0' : (isCollapsed ? 'pl-20' : 'pl-64');

  return (
    <div className="bg-background min-h-screen">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className={`transition-all duration-300 ${mainContentPadding}`}>
        <div className="flex flex-col h-screen">
          <div className="h-1 bg-gray-900"></div>
          <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isMobile={isMobile} />
          <PinSetupBadge />
          <TwoFactorAuthBadge />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
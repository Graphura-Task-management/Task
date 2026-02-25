import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import LeaderSidebar from "../../components/Leader/LeaderSidebar";
import LeaderTopbar from "../../components/Leader/LeaderTopbar";

export default function LeaderLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex overflow-x-hidden">
      
      {/* SIDEBAR */}
      <LeaderSidebar 
        isOpen={isMobileMenuOpen} 
        closeMobileMenu={() => setIsMobileMenuOpen(false)} 
      />

      {/* MAIN CONTENT AREA */}
      {/* Reduced desktop padding-left slightly if needed, but md:pl-64 matches Sidebar width */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen w-full transition-all duration-300">
        
        {/* TOPBAR */}
        <LeaderTopbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* CHANGES MADE BELOW:
            1. Reduced padding from p-4 lg:p-8 to p-3 lg:p-4 (Less space between Topbar and Content)
            2. Changed max-w-[1600px] to max-w-full (Removes side gaps on wide screens)
        */}
        <main className="flex-1 p-3 lg:p-4"> 
          <div className="w-full"> 
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
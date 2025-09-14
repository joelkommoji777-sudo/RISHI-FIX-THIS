import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center space-bg relative">
      {/* Enhanced Cosmic Background Layers */}
      <div className="absolute inset-0 nebula-glow opacity-40"></div>
      <div className="absolute inset-0 cosmic-depth opacity-30"></div>
      <div className="absolute inset-0 nebula-band opacity-20"></div>
      <div className="absolute inset-0 cosmic-glow opacity-15"></div>
      
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-[#CAF0F8] mb-4">Lost in the cosmic void!</p>
        <p className="text-lg text-[#90E0EF] mb-8">This page doesn't exist in our universe</p>
        <a 
          href="/" 
          className="inline-flex items-center rounded-sm border border-[#0077B6] bg-[#0077B6]/20 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur transition transform hover:scale-105 hover:bg-[#0077B6]/30 electric-glow"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

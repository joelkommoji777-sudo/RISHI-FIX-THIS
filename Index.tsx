import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Star, Zap, Users, Mail, Search } from "lucide-react";

// Typing animation component
const TypingAnimation = ({ text, speed = 100, delay = 0 }: { text: string; speed?: number; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, delay]);

  return <span>{displayText}</span>;
};

export default function Index() {

  return (
    <main className="min-h-screen relative overflow-hidden space-bg">
      {/* Enhanced Cosmic Background Layers */}
      <div className="absolute inset-0 nebula-glow"></div>
      <div className="absolute inset-0 cosmic-depth"></div>
      <div className="absolute inset-0 nebula-band"></div>
      <div className="absolute inset-0 cosmic-glow"></div>
      
      {/* Homepage Star Field */}
      <div className="absolute inset-0 opacity-80">
        {/* Bright white stars */}
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              backgroundColor: '#FFFFFF',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          />
        ))}
        {/* Soft light blue stars */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={`soft-${i}`}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 1.5 + 0.5}px`,
              height: `${Math.random() * 1.5 + 0.5}px`,
              backgroundColor: '#CAF0F8',
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 3 + 3}s`,
            }}
          />
        ))}
        {/* Electric blue accent stars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`electric-${i}`}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
              backgroundColor: '#0077B6',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <section className="relative z-10 w-full">
        <div className="container mx-auto flex min-h-[52vh] flex-col items-center justify-center py-24 text-center md:min-h-[64vh]">
          <div 
            className="inline-flex items-center space-x-2 bg-[#001D3D]/30 backdrop-blur-sm border border-[#0077B6]/30 rounded-full px-4 py-2 mb-8 opacity-0 electric-glow"
            style={{ 
              animation: "fadeInUp 0.8s ease-out 0.2s forwards",
              animationFillMode: "forwards"
            }}
          >
            <Star className="w-4 h-4 text-[#00B4D8]" />
            <span className="text-sm font-medium text-white">AI-Powered Research</span>
          </div>
          <h1
            className="text-4xl font-extrabold tracking-tight text-white md:text-6xl opacity-0"
            style={{ 
              animation: "fadeInUp 1s ease-out 0.5s forwards",
              animationFillMode: "forwards"
            }}
          >
            <TypingAnimation 
              text="Accelerate Research Discovery." 
              speed={80} 
              delay={500}
            />
          </h1>
          <p
            className="text-[#CAF0F8] mt-4 max-w-2xl text-base md:text-lg opacity-0"
            style={{ 
              animation: "fadeInUp 0.8s ease-out 1.2s forwards",
              animationFillMode: "forwards"
            }}
          >
            Empower researchers with tools that find collaborators, surface
            insights, and make outreach effortless.
          </p>
          <div 
            className="mt-8 opacity-0"
            style={{ 
              animation: "fadeInUp 0.8s ease-out 1.5s forwards",
              animationFillMode: "forwards"
            }}
          >
            <a
              href="#about"
              className="inline-flex items-center rounded-sm border border-[#0077B6] bg-[#0077B6]/20 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur transition transform hover:scale-105 hover:bg-[#0077B6]/30 electric-glow"
            >
              Explore the Cosmos
            </a>
          </div>
        </div>
      </section>

      {/* Belief statement */}
      <section className="container py-20 md:py-28 relative z-10">
        <p
          className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#90E0EF] opacity-0"
          style={{ 
            animation: "fadeInUp 0.8s ease-out 2s forwards",
            animationFillMode: "forwards"
          }}
        >
          Our Research Mission
        </p>
        <h2
          className="mx-auto mt-4 max-w-4xl text-center text-2xl font-semibold leading-snug text-white md:text-3xl opacity-0"
          style={{ 
            animation: "fadeInUp 0.8s ease-out 2.2s forwards",
            animationFillMode: "forwards"
          }}
        >
          Advance knowledge, empower discovery, and connect researchers
          worldwide.
        </h2>
      </section>

      {/* Two-up sections */}
      <section
        id="about"
        className="container space-y-24 pb-24 md:space-y-32 md:pb-32 relative z-10"
      >
        {/* Row 1 */}
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div
            className="order-2 md:order-1 opacity-0"
            style={{ 
              animation: "fadeInLeft 0.8s ease-out 2.5s forwards",
              animationFillMode: "forwards"
            }}
          >
            <h3 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              Smart Resume Extraction
            </h3>
            <p className="mt-4 max-w-prose text-[#CAF0F8]">
              Upload your resume and let our AI do the work. We automatically
              extract and organize the important details, giving you a clean,
              editable version you can refine. No more formatting headaches—just
              a polished profile ready for outreach.
            </p>
          </div>
          <div 
            className="order-1 aspect-[16/10] w-full rounded-sm bg-[#001D3D]/30 backdrop-blur-sm border border-[#0077B6]/30 shadow md:order-2 transform transition-transform duration-700 hover:scale-105 flex items-center justify-center opacity-0 electric-glow"
            style={{ 
              animation: "fadeInRight 0.8s ease-out 2.7s forwards",
              animationFillMode: "forwards"
            }}
          >
            <div className="text-center p-8">
              <div className="w-24 h-24 cosmic-gradient rounded-full flex items-center justify-center mx-auto mb-4 sky-glow">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">AI-Powered Analysis</h4>
              <p className="text-[#90E0EF] text-sm mb-4">Intelligent Resume Processing</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-[#0077B6]/20 text-[#00B4D8] text-xs rounded-full border border-[#0077B6]/30">Machine Learning</span>
                <span className="px-3 py-1 bg-[#0077B6]/20 text-[#00B4D8] text-xs rounded-full border border-[#0077B6]/30">NLP</span>
                <span className="px-3 py-1 bg-[#0077B6]/20 text-[#00B4D8] text-xs rounded-full border border-[#0077B6]/30">Deep Learning</span>
                <span className="px-3 py-1 bg-[#0077B6]/20 text-[#00B4D8] text-xs rounded-full border border-[#0077B6]/30">AI Ethics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div 
            className="order-1 aspect-[16/10] w-full rounded-sm bg-[#001D3D]/30 backdrop-blur-sm border border-[#00B4D8]/30 shadow transform transition-transform duration-700 hover:scale-105 flex items-center justify-center opacity-0 cyan-glow"
            style={{ 
              animation: "fadeInLeft 0.8s ease-out 3s forwards",
              animationFillMode: "forwards"
            }}
          >
            <div className="text-center p-8">
              <div className="w-24 h-24 cosmic-gradient rounded-full flex items-center justify-center mx-auto mb-4 sky-glow">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Professor Matching</h4>
              <p className="text-[#90E0EF] text-sm">AI-powered recommendations</p>
            </div>
          </div>
          <div
            className="order-2 opacity-0"
            style={{ 
              animation: "fadeInRight 0.8s ease-out 3.2s forwards",
              animationFillMode: "forwards"
            }}
          >
            <h3 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              Find the Right Professors
            </h3>
            <p className="mt-4 max-w-prose text-[#CAF0F8]">
              Skip the endless searching. Simply choose your college and
              research interests, and our AI matches you with the professors
              most relevant to your background and goals. Personalized
              recommendations save you time and help you connect with the right
              mentors.
            </p>
          </div>
        </div>

        {/* Mirrored section: text left, plain black box right (placeholder for custom image) */}
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div
            className="order-2 md:order-1 opacity-0"
            style={{ 
              animation: "fadeInLeft 0.8s ease-out 3.5s forwards",
              animationFillMode: "forwards"
            }}
          >
            <h3 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              Effortless Emailing
            </h3>
            <p className="mt-4 max-w-prose text-[#CAF0F8]">
              Connect your Gmail and send professional cold emails directly from
              our platform. No copy-paste, no juggling multiple tabs—just
              seamless outreach that makes building academic connections easier
              than ever.
            </p>
          </div>

          <div 
            className="order-1 aspect-[16/10] w-full rounded-sm bg-[#001D3D]/30 backdrop-blur-sm border border-[#90E0EF]/30 shadow md:order-2 transform transition-transform duration-700 hover:scale-105 flex items-center justify-center opacity-0 sky-glow"
            style={{ 
              animation: "fadeInRight 0.8s ease-out 3.7s forwards",
              animationFillMode: "forwards"
            }}
          >
            <div className="text-center p-8">
              <div className="w-24 h-24 cosmic-gradient rounded-full flex items-center justify-center mx-auto mb-4 sky-glow">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Smart Outreach</h4>
              <p className="text-[#90E0EF] text-sm">Automated email campaigns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cosmic Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0, 8, 20, 0.8) 0%, rgba(0, 29, 61, 0.4) 50%, transparent 100%)' }}></div>
    </main>
  );
}

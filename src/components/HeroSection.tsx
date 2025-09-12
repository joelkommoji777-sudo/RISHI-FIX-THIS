import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/onboarding/personal-info');
  };

  const handleLogin = () => {
    navigate('/onboarding/personal-info');
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-background pt-20">
      <div className="container mx-auto px-6 text-center">
        {/* Main heading */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-foreground">
          Professor Matching.
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Find target professors and universities. Connect with research opportunities that match your interests.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleGetStarted}
            className="bg-foreground text-background hover:bg-foreground/90 px-8 py-4 text-lg"
          >
            Get Started
          </Button>
          <Button 
            onClick={handleLogin}
            variant="outline"
            className="px-8 py-4 text-lg"
          >
            Login
          </Button>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Resume</h3>
            <p className="text-sm text-muted-foreground">AI-powered resume analysis and extraction</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎓</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Find Professors</h3>
            <p className="text-sm text-muted-foreground">Match with research professors at top universities</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Send Emails</h3>
            <p className="text-sm text-muted-foreground">Automated personalized outreach emails</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
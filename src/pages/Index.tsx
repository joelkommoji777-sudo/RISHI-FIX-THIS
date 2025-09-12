import HeroSection from "@/components/HeroSection";
import WorkflowSection from "@/components/WorkflowSection";
import CustomProjectsSection from "@/components/CustomProjectsSection";
import ProcessSection from "@/components/ProcessSection";
import AIAssistantSection from "@/components/AIAssistantSection";
import BenefitsSection from "@/components/BenefitsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <WorkflowSection />
      <BenefitsSection />
    </div>
  );
};

export default Index;

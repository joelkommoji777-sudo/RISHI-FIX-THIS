import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProfessorMatch from "./pages/ProfessorMatch";
import Dashboard from "./pages/Dashboard";
import OnboardingPersonalInfo from "./pages/OnboardingPersonalInfo";
import OnboardingResume from "./pages/OnboardingResume";
import ProfessorHistory from "./pages/ProfessorHistory";
import EmailSettings from "./pages/EmailSettings";
import OAuthCallback from "./pages/OAuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 ml-16 lg:ml-64 transition-all duration-300 ease-in-out">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/professor-match" element={<ProfessorMatch />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding/personal-info" element={<OnboardingPersonalInfo />} />
              <Route path="/onboarding/resume" element={<OnboardingResume />} />
              <Route path="/history" element={<ProfessorHistory />} />
              <Route path="/email-settings" element={<EmailSettings />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

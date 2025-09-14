import "./global.css";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import AuthFlow from "./pages/AuthFlow";
import Dashboard from "./pages/Dashboard";
import Professors from "./pages/Professors";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth, ProtectedRoute } from "@/lib/auth";
import { Sun, Moon } from "lucide-react";

const queryClient = new QueryClient();

function HeaderContent() {
  const auth = useAuth();
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch (e) {
      // noop
    }
  }, [isDark]);

  return (
    <header className="w-full border-b border-[#003566]/30 bg-[#000814]/90 backdrop-blur supports-[backdrop-filter]:bg-[#000814]/80">
      <div className="container flex items-center justify-between py-4">
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="font-semibold text-white tracking-tight hover:text-[#00B4D8] transition-colors"
          >
            Research Cosmos
          </Link>
          {auth.isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-[#CAF0F8] hover:text-[#00B4D8] hover:underline transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/professors"
                className="text-sm text-[#CAF0F8] hover:text-[#00B4D8] hover:underline transition-colors"
              >
                Professors
              </Link>
              <Link
                to="/profile"
                className="text-sm text-[#CAF0F8] hover:text-[#00B4D8] hover:underline transition-colors"
              >
                Profile
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setIsDark((s) => !s)}
            aria-label="Toggle color scheme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#0077B6]/30 bg-[#001D3D]/30 text-[#CAF0F8] hover:bg-[#001D3D]/50 hover:text-[#00B4D8] transition-colors"
            title="Toggle color scheme"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {!auth.isAuthenticated ? (
            <>
              <Link
                to="/auth"
                className="text-sm font-medium text-[#CAF0F8] hover:text-[#00B4D8] hover:underline transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center rounded-sm border border-[#0077B6] bg-[#0077B6]/20 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0077B6]/30 electric-glow transition-all"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <div className="text-sm text-[#CAF0F8]">
                {auth.user?.name || auth.user?.email}
              </div>
              <button
                onClick={() => auth.logout()}
                className="rounded px-3 py-1 text-sm text-[#CAF0F8] hover:text-[#00B4D8] hover:underline transition-colors"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <HeaderContent />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthFlow />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/professors"
              element={
                <ProtectedRoute>
                  <Professors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

import { createRoot as _createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing");

if (!(window as any).__appRoot) {
  (window as any).__appRoot = _createRoot(container);
}
(window as any).__appRoot.render(<App />);

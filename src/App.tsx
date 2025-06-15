
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Strategies from "./pages/Strategies";
import Feed from "./pages/Feed";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { SessionProvider } from "./contexts/SessionProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { TwelveDataProvider } from "./contexts/TwelveDataProvider";
import StrategyPage from "./pages/StrategyPage";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Update the document title to KabuName
    document.title = "KabuName - Trading Strategy Management";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SessionProvider>
          <TwelveDataProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/strategies" element={<Strategies />} />
                  <Route path="/strategies/:strategyId" element={<StrategyPage />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/u/:username" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TwelveDataProvider>
        </SessionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

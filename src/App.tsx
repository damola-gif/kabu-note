
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
import PublicProfile from "./pages/PublicProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import { SessionProvider } from "./contexts/SessionProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { TwelveDataProvider } from "./contexts/TwelveDataProvider";
import StrategyPage from "./pages/StrategyPage";
import { useEffect } from "react";
import Rooms from "./pages/Rooms";
import RoomPage from "./pages/RoomPage";
import FollowingStrategies from "./pages/FollowingStrategies";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Update the document title
    document.title = "KabuNote - Trading Strategy Management";
    
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
                
                {/* Public profile route - accessible without authentication */}
                <Route path="/u/:username" element={<PublicProfile />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/strategies" element={<Strategies />} />
                  <Route path="/strategies/:strategyId" element={<StrategyPage />} />
                  <Route path="/following-strategies" element={<FollowingStrategies />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/rooms/:roomId" element={<RoomPage />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<Profile />} />
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

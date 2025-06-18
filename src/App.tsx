
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from './contexts/SessionProvider';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Feed from './pages/Feed';
import Strategies from './pages/Strategies';
import StrategyPage from './pages/StrategyPage';
import FollowingStrategies from './pages/FollowingStrategies';
import Journal from './pages/Journal';
import Rooms from './pages/Rooms';
import RoomPage from './pages/RoomPage';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes with AppShell */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="/home" element={<Dashboard />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/strategies" element={<Strategies />} />
                <Route path="/strategies/:id" element={<StrategyPage />} />
                <Route path="/following-strategies" element={<FollowingStrategies />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/:id" element={<RoomPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/u/:username" element={<PublicProfile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
              {/* Onboarding is special - no AppShell */}
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>
            
            {/* Landing page for non-authenticated users */}
            <Route path="/" element={<Index />} />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default App;

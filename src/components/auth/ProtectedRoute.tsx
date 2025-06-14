
import { useSession } from "@/contexts/SessionProvider";
import { Navigate, Outlet } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";

export const ProtectedRoute = () => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Onboarding is a special case that doesn't use the main AppShell
  if (window.location.pathname === '/onboarding') {
    return <Outlet />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

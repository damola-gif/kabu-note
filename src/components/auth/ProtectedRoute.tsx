
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/contexts/SessionProvider';
import { Skeleton } from '@/components/ui/skeleton';

export function ProtectedRoute() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

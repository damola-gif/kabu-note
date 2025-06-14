
import { useSession } from "@/contexts/SessionProvider";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";

const Index = () => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex w-full min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between py-4 px-6 border-b">
        <div className="font-montserrat text-lg font-bold">KabuTrade</div>
        <Button asChild variant="ghost">
          <Link to="/auth">Sign In</Link>
        </Button>
      </header>
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to KabuTrade</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Your all-in-one platform to log, analyze, and supercharge your trading performance.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/auth">Get Started for Free</Link>
        </Button>
      </main>
    </div>
  );
};

export default Index;

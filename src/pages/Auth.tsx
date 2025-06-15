
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";

// Logo Placeholder
function KabuLogo() {
  return (
    <div className="flex flex-col items-center mb-4">
      <span className="text-3xl font-extrabold text-primary">KabuTrade</span>
      <span className="text-muted-foreground text-xs font-montserrat">Your complete trading companion</span>
    </div>
  );
}

export default function Auth() {
  const { session } = useSession();
  const [tab, setTab] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        toast.error(error.message);
        setGoogleLoading(false);
      }
      // Note: If successful, the user will be redirected, so we don't set loading to false here
    } catch (error: any) {
      console.error('Unexpected error during Google sign-in:', error);
      toast.error("An unexpected error occurred during Google sign-in");
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === "sign-up") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          console.error('Sign up error:', error);
          toast.error(error.message);
        } else {
          toast.success("Check your email for the confirmation link!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Sign in error:', error);
          toast.error(error.message);
        } else {
          toast.success("Signed in successfully!");
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error('Unexpected auth error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg animate-fade-in">
        <CardContent className="pt-6">
          <KabuLogo />
          <div className="flex mb-4">
            <button
              className={cn("flex-1 p-2 font-semibold rounded-t-md", tab === "sign-in" ? "bg-background" : "bg-muted/70 text-muted-foreground")}
              onClick={() => setTab("sign-in")}
            >
              Sign In
            </button>
            <button
              className={cn("flex-1 p-2 font-semibold rounded-t-md", tab === "sign-up" ? "bg-background" : "bg-muted/70 text-muted-foreground")}
              onClick={() => setTab("sign-up")}
            >
              Sign Up
            </button>
          </div>
          
          <Button 
            className="w-full mb-4 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50" 
            variant="outline" 
            onClick={handleGoogleSignIn} 
            disabled={loading || googleLoading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <div className="flex items-center gap-2 mb-4">
            <hr className="flex-1" />
            <span className="text-xs text-muted-foreground">— or —</span>
            <hr className="flex-1" />
          </div>

          <form className="space-y-3 mb-4" onSubmit={handleAuth}>
            <Input 
              placeholder="Email" 
              type="email"
              required 
              autoComplete="username" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={loading || googleLoading} 
            />
            <Input 
              placeholder="Password" 
              type="password" 
              required 
              autoComplete={tab === "sign-up" ? "new-password" : "current-password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              disabled={loading || googleLoading} 
            />
            {tab === "sign-up" && (
              <Input 
                placeholder="Confirm Password" 
                type="password" 
                required 
                autoComplete="new-password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                disabled={loading || googleLoading} 
              />
            )}
            {tab === "sign-in" && (
              <a href="#" className="text-xs text-primary/80 hover:underline float-right">
                Forgot password?
              </a>
            )}
            <Button className="w-full mt-3" type="submit" disabled={loading || googleLoading}>
              {loading ? "Processing..." : tab === "sign-in" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

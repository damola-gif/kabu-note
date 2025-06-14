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
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        toast.error(error.message);
      } else {
        toast.success("Signed in successfully!");
        navigate("/dashboard");
      }
    }
    setLoading(false);
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
          <Button className="w-full mb-4" variant="secondary" disabled>
            Continue with Google
            {/* Hook up supabase.auth.signInWithOAuth in backend step */}
          </Button>

          <div className="flex items-center gap-2 mb-4">
            <hr className="flex-1" />
            <span className="text-xs text-muted-foreground">— or —</span>
            <hr className="flex-1" />
          </div>

          <form className="space-y-3 mb-4" onSubmit={handleAuth}>
            <Input placeholder="Email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Password" type="password" required autoComplete={tab === "sign-up" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            {tab === "sign-up" && <Input placeholder="Confirm Password" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />}
            {tab === "sign-in" && <a href="#" className="text-xs text-primary/80 hover:underline float-right">Forgot password?</a>}
            <Button className="w-full mt-3" type="submit" disabled={loading}>
              {loading ? "Processing..." : tab === "sign-in" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {/* TODO: "Continue as Guest" option */}
        </CardFooter>
      </Card>
    </div>
  );
}

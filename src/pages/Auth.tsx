
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs } from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

// Logo Placeholder
function KabuLogo() {
  return (
    <div className="flex flex-col items-center mb-4">
      <span className="text-3xl font-extrabold text-primary">KabuNote</span>
      <span className="text-muted-foreground text-xs font-montserrat">Your complete trading companion</span>
    </div>
  );
}

export default function Auth() {
  const [tab, setTab] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <Card className="w-full max-w-sm shadow-lg animate-fade-in">
        <CardContent>
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
          <Button className="w-full mb-4" variant="secondary">
            Continue with Google
            {/* Hook up supabase.auth.signInWithOAuth in backend step */}
          </Button>

          <div className="flex items-center gap-2 mb-4">
            <hr className="flex-1" />
            <span className="text-xs text-muted-foreground">— or —</span>
            <hr className="flex-1" />
          </div>

          <form className="space-y-3 mb-4">
            <Input placeholder="Email" required autoComplete="username" />
            <Input placeholder="Password" type="password" required autoComplete={tab === "sign-up" ? "new-password" : "current-password"} />
            {tab === "sign-up" && <Input placeholder="Confirm Password" type="password" required autoComplete="new-password" />}
            {tab === "sign-in" && <a href="#" className="text-xs text-primary/80 hover:underline float-right">Forgot password?</a>}
            <Button className="w-full mt-3">{tab === "sign-in" ? "Sign In" : "Create Account"}</Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {/* TODO: "Continue as Guest" option */}
        </CardFooter>
      </Card>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const LandingHeader = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between py-6 px-8">
      <div className="font-bold text-2xl">KabuNote</div>
      <Button 
        asChild 
        variant="outline" 
        className="border-orange-500/50 text-orange-400 hover:bg-orange-500 hover:text-black transition-all duration-300"
      >
        <Link to="/auth">Get Started</Link>
      </Button>
    </header>
  );
};


import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-32 px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-light mb-8">
          Ready to <span className="text-orange-400">transform</span>
          <br />
          your trading?
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join thousands of traders who are already using KabuNote to enhance their strategies.
        </p>
        <Button 
          asChild 
          size="lg" 
          className="bg-orange-500 hover:bg-orange-600 text-black font-medium px-12 py-6 text-lg rounded-xl transition-all duration-300"
        >
          <Link to="/auth" className="flex items-center gap-2">
            Start Free Today
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

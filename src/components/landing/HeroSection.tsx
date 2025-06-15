
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onShowVideoModal: () => void;
}

export const HeroSection = ({ onShowVideoModal }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-black to-purple-900/20"></div>
      
      {/* Geometric Lines */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-light mb-8 leading-tight">
          Discover the
          <br />
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent font-normal">
            transformative power
          </span>
          <br />
          of trading strategies
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Experience the future of trading with our AI-powered platform. 
          Collaborate, analyze, and execute with precision.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-black font-medium px-8 py-4 rounded-xl transition-all duration-300"
          >
            <Link to="/auth" className="flex items-center gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button 
            onClick={onShowVideoModal}
            variant="ghost" 
            size="lg"
            className="text-gray-300 hover:text-white px-8 py-4 transition-all duration-300"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

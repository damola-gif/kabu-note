
import { useSession } from "@/contexts/SessionProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, Navigate } from "react-router-dom";
import { 
  Users, 
  Brain, 
  TrendingUp, 
  Radio,
  Play,
  X,
  ArrowRight
} from "lucide-react";
import { useState } from "react";

const Index = () => {
  const { session, loading } = useSession();
  const [showVideoModal, setShowVideoModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Users,
      title: "Community Strategies",
      description: "Collaborate with traders worldwide. Share, fork, and evolve strategies together."
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Transform your trading notes into actionable checklists with intelligent automation."
    },
    {
      icon: TrendingUp,
      title: "Live Performance",
      description: "Real-time analytics and performance tracking with instant market data."
    },
    {
      icon: Radio,
      title: "Market Intelligence",
      description: "Stay ahead with live market feeds and intelligent trade signals."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
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

      {/* Hero Section */}
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
              onClick={() => setShowVideoModal(true)}
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

      {/* Features Section */}
      <section className="py-32 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-6">
              Built for <span className="text-orange-400">modern traders</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to elevate your trading game in one intelligent platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-to-b from-gray-900/50 to-black/50 border-gray-800/50 hover:border-orange-500/30 transition-all duration-500 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="font-bold text-2xl mb-6">KabuNote</div>
              <p className="text-gray-400 leading-relaxed">
                The future of trading strategies, powered by AI and community collaboration.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-6 text-white">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-6 text-white">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800/50 mt-16 pt-8 text-center text-gray-400">
            <p>© 2025 KabuNote. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h3 className="text-xl font-medium text-white">Product Demo</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
                <p className="text-gray-400">Demo video coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

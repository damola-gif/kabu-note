
import { useSession } from "@/contexts/SessionProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, Navigate } from "react-router-dom";
import { 
  Rocket, 
  Users, 
  Brain, 
  TrendingUp, 
  Palette, 
  Radio,
  Star,
  Play,
  CheckCircle,
  X
} from "lucide-react";
import { useState } from "react";

const Index = () => {
  const { session, loading } = useSession();
  const [showVideoModal, setShowVideoModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
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
      title: "Community Constellations",
      description: "Publish & fork public strategies—light‑years beyond siloed journals. Real‑time reactions, comments, and follows build your orbit of collaborators."
    },
    {
      icon: Brain,
      title: "AI‑Guided Flight Plans",
      description: "Write in Markdown with live preview—and one‑click transform into pre‑trade checklists via ChatGPT. Never miss a step in your strategy launch sequence."
    },
    {
      icon: TrendingUp,
      title: "Live Backtest Nebula",
      description: "Strategy cards display win‑rate badges, equity‑curve thumbnails, and P/L snapshots at warp speed. Drill down in‑app—no external probes required."
    },
    {
      icon: Palette,
      title: "Futuristic Dark UX",
      description: "Deep‑space palette (onyx, obsidian, starlight blue) with neon highlights. Responsive, cloud‑native design that feels as infinite as the cosmos."
    },
    {
      icon: Radio,
      title: "Real‑Time Market Telemetry",
      description: "\"Use Current Price\" populates fields from live feeds. Live P/L badges and instant SL/TP alerts keep you on the frontier."
    }
  ];

  const testimonials = [
    {
      text: "KabuNote's AI checklists are my mission control—can't imagine trading without them.",
      author: "Amina T., Quant Trader",
      icon: "⭐"
    },
    {
      text: "The dark UI with neon highlights feels like piloting a starcruiser through my strategies.",
      author: "Marcus L., Swing Trader", 
      icon: "🚀"
    }
  ];

  const pricingTiers = [
    {
      name: "Free Flight",
      price: "$0/mo",
      features: ["Public Sharing", "AI Checklists: 3/mo", "Backtest Snaps: 5/mo", "Team Seats: —"],
      highlight: false
    },
    {
      name: "Pro Voyager", 
      price: "$29/mo",
      features: ["Public Sharing", "AI Checklists: Unlimited", "Backtest Snaps: Unlimited", "Team Seats: 3"],
      highlight: true
    },
    {
      name: "Enterprise Armada",
      price: "Custom",
      features: ["Public Sharing", "AI Checklists: Unlimited + SLA", "Backtest Snaps: Unlimited", "Team Seats: Custom"],
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="relative z-50 flex items-center justify-between py-6 px-6 border-b border-gray-800">
        <div className="font-montserrat text-xl font-bold text-cyan-400">KabuNote</div>
        <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900">
          <Link to="/auth">Sign In</Link>
        </Button>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 overflow-hidden">
        {/* Animated starfield background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/30 to-transparent"></div>
          <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-[20%] right-[30%] w-0.5 h-0.5 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-[40%] left-[10%] w-0.5 h-0.5 bg-blue-400 rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-[60%] right-[20%] w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-[80%] left-[70%] w-0.5 h-0.5 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-[30%] right-[50%] w-0.5 h-0.5 bg-blue-400 rounded-full animate-pulse delay-200"></div>
        </div>
        
        {/* Semi-transparent overlay panel */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gray-900/70 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-12 shadow-2xl shadow-cyan-400/20">
            {/* Glowing headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 drop-shadow-2xl">
              Command Your Trading Universe
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Chart, share, and execute strategies in a cosmic, AI‑powered environment.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 shadow-lg shadow-cyan-400/30 text-lg px-8 py-4"
              >
                <Link to="/auth">🚀 Launch Free Flight</Link>
              </Button>
              
              <Button 
                onClick={() => setShowVideoModal(true)}
                variant="outline" 
                size="lg"
                className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900 shadow-lg shadow-blue-400/30 text-lg px-8 py-4"
              >
                <Play className="mr-2 h-5 w-5" />
                ✨ Stellar Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 px-6 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            ✨ What Makes Us Different
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900/80 border-gray-700 hover:border-cyan-400/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <feature.icon className="h-8 w-8 text-cyan-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            🚀 How It Works in 3 Light‑Speed Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xl mx-auto">1</div>
              <h3 className="text-xl font-semibold">Draft Your Strategy</h3>
              <p className="text-gray-300">Draft your strategy in the live Markdown "notepad."</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xl mx-auto">2</div>
              <h3 className="text-xl font-semibold">Organize & Share</h3>
              <p className="text-gray-300">Organize & Share with tags, filters, and community orbit.</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xl mx-auto">3</div>
              <h3 className="text-xl font-semibold">Execute</h3>
              <p className="text-gray-300">Execute via AI‑powered checklists and real‑time market feeds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            💬 Stellar Testimonials
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-900/80 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{testimonial.icon}</div>
                    <div>
                      <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                      <p className="text-cyan-400 font-semibold">— {testimonial.author}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            💳 Pricing Preview
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`${tier.highlight ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' : 'border-gray-700'} bg-gray-900/80`}>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                    <div className="text-3xl font-bold text-cyan-400">{tier.price}</div>
                  </div>
                  
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    asChild 
                    className={`w-full mt-6 ${tier.highlight ? 'bg-cyan-400 text-gray-900 hover:bg-cyan-300' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                  >
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-center text-gray-400 mt-8">
            "No credit card required" — Start Free Flight today.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-cyan-400">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-cyan-400">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-cyan-400">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-cyan-400">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 KabuNote — "Mapping your trades across the stars."</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Stellar Demo</h3>
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
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
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


import { Card, CardContent } from "@/components/ui/card";
import { Users, Brain, TrendingUp, Radio } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "Community Strategies",
      description: "Collaborate with traders worldwide. Share, fork, and evolve strategies together."
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Coming soon - Transform your trading notes into actionable checklists with intelligent automation."
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
  );
};

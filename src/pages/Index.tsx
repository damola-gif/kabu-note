
import { useSession } from "@/contexts/SessionProvider";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { VideoModal } from "@/components/landing/VideoModal";

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
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <LandingHeader />
      <HeroSection onShowVideoModal={() => setShowVideoModal(true)} />
      <FeaturesSection />
      <CTASection />
      <LandingFooter />
      <VideoModal 
        isOpen={showVideoModal} 
        onClose={() => setShowVideoModal(false)} 
      />
    </div>
  );
};

export default Index;

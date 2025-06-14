
import { Button } from "@/components/ui/button";

const slides = [
  {
    title: "Log trades in seconds",
    desc: "Quickly record your trades. Focus on what matters.",
    img: "/onboarding1.png",
  },
  {
    title: "Annotate your charts",
    desc: "Mark up charts for clearer trade reviews.",
    img: "/onboarding2.png",
  },
  {
    title: "AI-powered checklists",
    desc: "Smarter trade routines with AI help.",
    img: "/onboarding3.png",
  }
];

export default function Onboarding() {
  // TODO: Add animation/swipe, state, skip/Get started logic
  return (
    <div className="w-full h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-card p-6 rounded-xl shadow-md animate-fade-in flex flex-col items-center">
        <img src={slides[0].img} alt="" className="mb-4 h-40 w-auto object-contain" />
        <h2 className="text-2xl font-bold mb-2">{slides[0].title}</h2>
        <p className="text-muted-foreground mb-6">{slides[0].desc}</p>
        <div className="w-full flex justify-between mt-auto">
          <Button variant="ghost">Skip</Button>
          <Button>Next</Button>
        </div>
      </div>
    </div>
  );
}

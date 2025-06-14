
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

const slides = [
  {
    title: "Log trades in seconds",
    description: "Quickly capture every detail of your trades without the hassle.",
    illustration: "📊",
  },
  {
    title: "Annotate your charts",
    description: "Mark up your chart screenshots to analyze your entries and exits.",
    illustration: "✍️",
  },
  {
    title: "AI-powered checklists",
    description: "Leverage AI to ensure your trades align with your strategy.",
    illustration: "🤖",
  },
];

export default function Onboarding() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);
  
  const handleDone = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const isLastSlide = current === count - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Carousel setApi={setApi} className="w-full max-w-md">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex flex-col aspect-square items-center justify-center p-6 text-center">
                    <div className="text-8xl mb-4">{slide.illustration}</div>
                    <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
                    <p className="text-muted-foreground">{slide.description}</p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="py-2 mt-4 text-center text-sm text-muted-foreground">
        <div className="flex gap-2 justify-center">
            {Array.from({ length: count }).map((_, i) => (
                <span key={i} className={`block h-2 w-2 rounded-full ${current === i ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
            ))}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4">
        <Button variant="ghost" onClick={handleDone} className={isLastSlide ? 'invisible' : ''}>
          Skip
        </Button>
        <Button onClick={isLastSlide ? handleDone : handleNext}>
          {isLastSlide ? "Get Started" : "Next"}
        </Button>
      </div>
    </div>
  );
}

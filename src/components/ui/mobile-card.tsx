
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  raised?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function MobileCard({ 
  children, 
  className, 
  raised = false,
  padding = "md" 
}: MobileCardProps) {
  const paddingClasses = {
    sm: "p-3",
    md: "p-4", 
    lg: "p-6"
  };

  return (
    <Card className={cn(
      "bg-white border border-gray-200",
      raised && "shadow-md hover:shadow-lg transition-shadow duration-200",
      className
    )}>
      <CardContent className={cn(paddingClasses[padding])}>
        {children}
      </CardContent>
    </Card>
  );
}

interface MobileStatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function MobileStatsCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  className
}: MobileStatsCardProps) {
  const trendColors = {
    up: "text-[#2AB7CA]",
    down: "text-red-500",
    neutral: "text-gray-500"
  };

  return (
    <MobileCard raised className={cn("min-w-[120px]", className)}>
      <div className="flex items-center justify-between mb-2">
        {icon && <div className="text-[#1E2A4E]">{icon}</div>}
        {trend && trendValue && (
          <span className={cn("text-xs font-medium", trendColors[trend])}>
            {trendValue}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-[#2AB7CA]">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </MobileCard>
  );
}

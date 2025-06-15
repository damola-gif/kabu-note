
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  valueClassName?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, valueClassName, trend }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#2AB7CA]/10 rounded-lg">
            <Icon className="h-6 w-6 text-[#2AB7CA]" />
          </div>
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className={cn("text-2xl font-bold", valueClassName)}>
          {value}
        </p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  );
}

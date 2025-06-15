
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const chartTypes = [
  { id: "winloss", label: "Win vs Loss" },
  { id: "equity", label: "Equity Curve" },
  { id: "rr", label: "RR Ratio" },
  { id: "asset", label: "By Asset" },
];

export function PerformanceChart() {
  const [activeChart, setActiveChart] = useState("winloss");

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1E2A4E] mb-4 sm:mb-0">
          Performance Summary
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {chartTypes.map((chart) => (
            <Button
              key={chart.id}
              variant={activeChart === chart.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart(chart.id)}
              className={cn(
                "text-xs",
                activeChart === chart.id && "bg-[#2AB7CA] hover:bg-[#2AB7CA]/90"
              )}
            >
              {chart.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Chart for {chartTypes.find(c => c.id === activeChart)?.label}</p>
          <p className="text-xs text-gray-400 mt-1">Chart implementation coming soon</p>
        </div>
      </div>
    </div>
  );
}

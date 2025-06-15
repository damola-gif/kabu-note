
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, X } from "lucide-react";

// Mock data - replace with real data
const mockOpenTrades = [
  {
    id: "1",
    asset: "AAPL",
    entryPrice: 150.25,
    tp: 160.00,
    sl: 145.00,
    currentPrice: 155.30,
    pnl: 5.05,
    status: "Running"
  },
  {
    id: "2", 
    asset: "EUR/USD",
    entryPrice: 1.0850,
    tp: 1.0900,
    sl: 1.0800,
    currentPrice: 1.0865,
    pnl: 15.00,
    status: "Running"
  }
];

export function OpenTrades() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1E2A4E]">Your Open Trades</h3>
        <Button size="sm" variant="outline">
          Filter
        </Button>
      </div>
      
      {mockOpenTrades.length > 0 ? (
        <div className="space-y-4">
          {mockOpenTrades.map((trade) => (
            <div key={trade.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Asset</p>
                    <p className="font-semibold">{trade.asset}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Entry</p>
                    <p className="font-medium">{trade.entryPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current</p>
                    <p className="font-medium">{trade.currentPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">P&L</p>
                    <p className={`font-semibold ${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {trade.pnl >= 0 ? "+" : ""}{trade.pnl}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-[#2AB7CA]/10 text-[#2AB7CA] border-[#2AB7CA]/20">
                    {trade.status}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No open trades</p>
        </div>
      )}
    </div>
  );
}

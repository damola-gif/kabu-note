import { AppShell } from "@/components/layout/AppShell";

export default function Dashboard() {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card shadow rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-bold text-green-600">Today's P/L</span>
          <span className="text-2xl font-mono">+0.00</span>
        </div>
        <div className="bg-card shadow rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-bold">Win Rate</span>
          <span className="text-2xl font-mono">0%</span>
        </div>
        <div className="bg-card shadow rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-bold">Open Trades</span>
          <span className="text-2xl font-mono">0</span>
        </div>
        <div className="bg-card shadow rounded-lg p-4 flex flex-col items-center">
          <span className="text-lg font-bold">Strategy</span>
          <span className="text-sm">No suggestion</span>
          <button className="mt-2 text-xs underline text-teal-600">Apply Checklist</button>
        </div>
      </div>
      {/* Equity curve chart placeholder */}
      <div className="bg-card rounded-lg shadow p-6 mb-6 min-h-[220px] flex justify-center items-center">
        Equity Curve Chart (placeholder)
      </div>
      {/* Open trades strip */}
      <div className="mb-6">
        <div className="overflow-x-auto flex gap-3">
          {/* Cards: render open trades here */}
          <div className="bg-muted px-4 py-2 rounded-lg min-w-[120px]">No open trades</div>
        </div>
      </div>
      {/* Recent closed trades */}
      <div className="bg-card rounded-lg shadow p-4">
        <strong>Recent Closed Trades</strong>
        <div className="divide-y">
          <div className="py-2 text-muted-foreground">No closed trades</div>
        </div>
      </div>
    </>
  );
}

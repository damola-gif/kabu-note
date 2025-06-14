import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

export default function Journal() {
  return (
    <AppShell>
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold">Trade Journal</h2>
        <Button variant="teal">New Trade</Button>
      </div>
      <div className="bg-card rounded-lg shadow p-4 mb-4 flex gap-3 flex-wrap items-center">
        <Button size="sm" variant="outline">All</Button>
        <Button size="sm" variant="outline">Long</Button>
        <Button size="sm" variant="outline">Short</Button>
        {/* TODO: Date range picker */}
      </div>
      <div className="bg-card rounded-lg shadow p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left font-bold px-2 py-2">Symbol</th>
              <th className="text-left font-bold px-2 py-2">Side</th>
              <th className="text-left font-bold px-2 py-2">Size</th>
              <th className="text-left font-bold px-2 py-2">Entry–Exit</th>
              <th className="text-left font-bold px-2 py-2">P/L</th>
              <th className="text-left font-bold px-2 py-2">Opened</th>
              <th className="text-left font-bold px-2 py-2">Closed</th>
              <th className="text-left font-bold px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="text-center text-muted-foreground py-7">No trades yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

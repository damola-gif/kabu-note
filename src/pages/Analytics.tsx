
import { AppShell } from "@/components/layout/AppShell";

export default function Analytics() {
  return (
    <AppShell>
      <div className="flex flex-col h-full w-full items-center justify-center">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Performance analytics will appear here.</p>
      </div>
    </AppShell>
  );
}

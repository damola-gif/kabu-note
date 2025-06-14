
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex items-center justify-between py-6 px-4 border-b">
            <SidebarTrigger />
            <div className="font-montserrat text-lg font-bold">Welcome to KabuTrade</div>
            <div />
          </header>
          <main className="flex flex-col items-center justify-center flex-1 px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to KabuTrade Nexus</h1>
            <p className="text-xl text-muted-foreground text-center max-w-xl">
              Manage your trading journal, strategies, and analytics in one place.
            </p>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;

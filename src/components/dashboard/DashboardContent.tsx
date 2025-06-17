
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { StrategyWithProfile } from "@/hooks/useStrategies";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { OpenTrades } from "@/components/dashboard/OpenTrades";
import { DraftStrategies } from "@/components/dashboard/DraftStrategies";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { InteractiveCharts } from '@/components/analytics/InteractiveCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardContentProps {
  trades: Tables<"trades">[];
  strategies: StrategyWithProfile[];
  onEdit: (trade: Tables<"trades">) => void;
  onClose: (trade: Tables<"trades">) => void;
  onDelete: (tradeId: string) => void;
  onViewDetails: (trade: Tables<"trades">) => void;
  isDeleting: boolean;
}

export function DashboardContent({
  trades,
  strategies,
  onEdit,
  onClose,
  onDelete,
  onViewDetails,
  isDeleting
}: DashboardContentProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  const openTrades = trades?.filter((t) => !t.closed_at) || [];

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Performance Chart */}
        <PerformanceChart trades={trades || []} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <OpenTrades 
              trades={openTrades}
              onEdit={onEdit}
              onClose={onClose}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              isDeleting={isDeleting}
            />
            <DraftStrategies strategies={strategies} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <RecentActivity strategies={strategies} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        {/* Interactive Charts */}
        <InteractiveCharts 
          trades={trades || []} 
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </TabsContent>
    </Tabs>
  );
}

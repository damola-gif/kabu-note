
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/contexts/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileText, Database } from "lucide-react";

export function DataExport() {
  const { user } = useSession();
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [dataStats, setDataStats] = useState({
    strategiesCount: 0,
    tradesCount: 0,
    totalDataSize: "0 KB",
    daysActive: 0
  });

  // Load data statistics
  useEffect(() => {
    const loadDataStats = async () => {
      if (!user) return;

      try {
        // Load strategies count
        const { count: strategiesCount } = await supabase
          .from('strategies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Load trades count
        const { count: tradesCount } = await supabase
          .from('trades')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Calculate days active (from first strategy or trade)
        const { data: firstStrategy } = await supabase
          .from('strategies')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1);

        const { data: firstTrade } = await supabase
          .from('trades')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1);

        let daysActive = 0;
        const firstActivity = [
          firstStrategy?.[0]?.created_at,
          firstTrade?.[0]?.created_at
        ].filter(Boolean).sort()[0];

        if (firstActivity) {
          const firstDate = new Date(firstActivity);
          const today = new Date();
          daysActive = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Estimate data size (rough calculation)
        const estimatedSize = ((strategiesCount || 0) * 2 + (tradesCount || 0) * 0.5);
        const sizeString = estimatedSize > 1024 ? 
          `${(estimatedSize / 1024).toFixed(1)} MB` : 
          `${estimatedSize.toFixed(1)} KB`;

        setDataStats({
          strategiesCount: strategiesCount || 0,
          tradesCount: tradesCount || 0,
          totalDataSize: sizeString,
          daysActive: Math.max(daysActive, 0)
        });
      } catch (error) {
        console.error('Error loading data stats:', error);
      }
    };

    loadDataStats();
  }, [user]);

  const exportData = async (type: 'trades' | 'strategies' | 'activity') => {
    if (!user) {
      toast.error('You must be logged in to export data');
      return;
    }

    setIsExporting(type);
    try {
      let data: any[] = [];
      let filename = '';

      switch (type) {
        case 'trades':
          const { data: trades, error: tradesError } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (tradesError) throw tradesError;
          data = trades || [];
          filename = `kabuname-trades-${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'strategies':
          const { data: strategies, error: strategiesError } = await supabase
            .from('strategies')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (strategiesError) throw strategiesError;
          data = strategies || [];
          filename = `kabuname-strategies-${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'activity':
          // Create a combined activity log
          const [tradesResult, strategiesResult] = await Promise.all([
            supabase.from('trades').select('created_at, symbol, side, entry_price, "trade" as type').eq('user_id', user.id),
            supabase.from('strategies').select('created_at, name, "strategy" as type').eq('user_id', user.id)
          ]);

          const activities = [
            ...(tradesResult.data || []),
            ...(strategiesResult.data || [])
          ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          data = activities;
          filename = `kabuname-activity-${new Date().toISOString().split('T')[0]}.json`;
          break;
      }

      if (data.length === 0) {
        toast.info(`No ${type} data found to export`);
        return;
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${type} exported successfully as ${filename}`);
    } catch (error: any) {
      console.error(`Error exporting ${type}:`, error);
      toast.error(`Failed to export ${type}: ${error.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Trading Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Export My Data</span>
          </CardTitle>
          <CardDescription>
            Download your data in JSON format for backup or analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-[#2AB7CA]" />
              <h3 className="font-medium mb-2">Trading Journal</h3>
              <p className="text-sm text-gray-500 mb-3">
                All your trades, P&L, and notes ({dataStats.tradesCount} trades)
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportData('trades')}
                disabled={isExporting === 'trades' || dataStats.tradesCount === 0}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting === 'trades' ? 'Exporting...' : 'Export Trades'}
              </Button>
            </div>

            <div className="p-4 border rounded-lg text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-[#2AB7CA]" />
              <h3 className="font-medium mb-2">Strategies</h3>
              <p className="text-sm text-gray-500 mb-3">
                Your trading strategies and notes ({dataStats.strategiesCount} strategies)
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportData('strategies')}
                disabled={isExporting === 'strategies' || dataStats.strategiesCount === 0}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting === 'strategies' ? 'Exporting...' : 'Export Strategies'}
              </Button>
            </div>

            <div className="p-4 border rounded-lg text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-[#2AB7CA]" />
              <h3 className="font-medium mb-2">Activity Log</h3>
              <p className="text-sm text-gray-500 mb-3">
                Your account activity history
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportData('activity')}
                disabled={isExporting === 'activity'}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting === 'activity' ? 'Exporting...' : 'Export Activity'}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Exported data includes all your personal trading information. 
              Keep these files secure and do not share them with unauthorized parties.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Information</CardTitle>
          <CardDescription>
            Information about your stored data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#2AB7CA]">{dataStats.strategiesCount}</p>
              <p className="text-sm text-gray-500">Strategies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2AB7CA]">{dataStats.tradesCount}</p>
              <p className="text-sm text-gray-500">Trades</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2AB7CA]">{dataStats.totalDataSize}</p>
              <p className="text-sm text-gray-500">Total Data</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2AB7CA]">{dataStats.daysActive}</p>
              <p className="text-sm text-gray-500">Days Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

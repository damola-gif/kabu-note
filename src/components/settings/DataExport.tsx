
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/contexts/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileText, Activity, BarChart3 } from "lucide-react";

export function DataExport() {
  const { user } = useSession();
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState<{
    totalTrades: number;
    totalStrategies: number;
    totalComments: number;
  } | null>(null);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch trades count
      const { count: tradesCount, error: tradesError } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (tradesError) throw tradesError;

      // Fetch strategies count
      const { count: strategiesCount, error: strategiesError } = await supabase
        .from('strategies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (strategiesError) throw strategiesError;

      // Fetch comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('strategy_comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (commentsError) throw commentsError;

      setStats({
        totalTrades: tradesCount || 0,
        totalStrategies: strategiesCount || 0,
        totalComments: commentsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch user statistics');
    }
  };

  const exportData = async (dataType: 'all' | 'trades' | 'strategies' | 'activity') => {
    if (!user) {
      toast.error('You must be logged in to export data');
      return;
    }

    setIsExporting(true);
    try {
      let exportData: any = {};
      let filename = `kabuname_${dataType}_${new Date().toISOString().split('T')[0]}.json`;

      if (dataType === 'trades' || dataType === 'all') {
        const { data: trades, error: tradesError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (tradesError) throw tradesError;
        exportData.trades = trades;
      }

      if (dataType === 'strategies' || dataType === 'all') {
        const { data: strategies, error: strategiesError } = await supabase
          .from('strategies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (strategiesError) throw strategiesError;
        exportData.strategies = strategies;
      }

      if (dataType === 'activity' || dataType === 'all') {
        // Export likes given
        const { data: likes, error: likesError } = await supabase
          .from('strategy_likes')
          .select('strategy_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (likesError) throw likesError;

        // Export comments
        const { data: comments, error: commentsError } = await supabase
          .from('strategy_comments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (commentsError) throw commentsError;

        // Export follows
        const { data: following, error: followingError } = await supabase
          .from('follows')
          .select('following_id, created_at')
          .eq('follower_id', user.id)
          .order('created_at', { ascending: false });

        if (followingError) throw followingError;

        exportData.activity = {
          likes,
          comments,
          following,
        };
      }

      // Add metadata
      exportData.metadata = {
        exportDate: new Date().toISOString(),
        userEmail: user.email,
        exportType: dataType,
        version: '1.0'
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${dataType} data exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Load stats on component mount
  useState(() => {
    fetchUserStats();
  });

  return (
    <div className="space-y-6">
      {/* Data Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Your Data Overview
          </CardTitle>
          <CardDescription>
            Summary of your data stored in KabuName
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#2AB7CA]">{stats.totalTrades}</div>
                <div className="text-sm text-gray-500">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#2AB7CA]">{stats.totalStrategies}</div>
                <div className="text-sm text-gray-500">Total Strategies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#2AB7CA]">{stats.totalComments}</div>
                <div className="text-sm text-gray-500">Total Comments</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-500">Loading statistics...</div>
            </div>
          )}
          
          <Button 
            onClick={fetchUserStats} 
            variant="outline" 
            className="mt-4 w-full"
          >
            Refresh Statistics
          </Button>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download your data in JSON format for backup or migration purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => exportData('all')}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export All Data
            </Button>

            <Button
              onClick={() => exportData('trades')}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Export Trades Only
            </Button>

            <Button
              onClick={() => exportData('strategies')}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export Strategies Only
            </Button>

            <Button
              onClick={() => exportData('activity')}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Export Activity Only
            </Button>
          </div>

          {isExporting && (
            <div className="text-center py-4">
              <div className="text-sm text-gray-500">Preparing your data export...</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">
            <strong>All Data:</strong> Includes trades, strategies, comments, likes, and following data
          </div>
          <div className="text-sm text-gray-600">
            <strong>Trades Only:</strong> Your trading history, P&L, and trade details
          </div>
          <div className="text-sm text-gray-600">
            <strong>Strategies Only:</strong> Your created strategies and associated metadata
          </div>
          <div className="text-sm text-gray-600">
            <strong>Activity Only:</strong> Your likes, comments, and social interactions
          </div>
          <div className="text-xs text-gray-500 mt-4">
            Data is exported in JSON format and includes timestamps in UTC. 
            Personal information is limited to what you've provided in your profile.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, FileText, Database } from "lucide-react";

export function DataExport() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const exportData = async (type: 'trades' | 'strategies' | 'activity') => {
    setIsExporting(type);
    try {
      // TODO: Implement actual data export logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileName = `kabuname-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      toast.success(`${type} exported successfully as ${fileName}`);
    } catch (error) {
      toast.error(`Failed to export ${type}`);
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
            Download your data in CSV or JSON format for backup or analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-[#2AB7CA]" />
              <h3 className="font-medium mb-2">Trading Journal</h3>
              <p className="text-sm text-gray-500 mb-3">
                All your trades, P&L, and notes
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportData('trades')}
                disabled={isExporting === 'trades'}
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
                Your trading strategies and notes
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportData('strategies')}
                disabled={isExporting === 'strategies'}
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
              <p className="text-2xl font-bold text-[#2AB7CA]">24</p>
              <p className="text-sm text-gray-500">Strategies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2AB7CA]">156</p>
              <p className="text-sm text-gray-500">Trades</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2AB7CA]">3.2MB</p>
              <p className="text-sm text-gray-500">Total Data</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2AB7CA]">89</p>
              <p className="text-sm text-gray-500">Days Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

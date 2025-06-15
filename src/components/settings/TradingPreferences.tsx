
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "NGN", label: "Nigerian Naira (NGN)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
];

const timeframes = [
  { value: "1m", label: "1 Minute" },
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hours" },
  { value: "1d", label: "1 Day" },
  { value: "1w", label: "1 Week" },
];

export function TradingPreferences() {
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    currency: "USD",
    defaultTimeframe: "1d",
    tradeAlertsEnabled: true,
    alertSoundEnabled: true
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement preferences save logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Trading preferences updated!");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>
            Choose your preferred currency for displaying values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Currency</Label>
            <Select 
              value={preferences.currency} 
              onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Chart Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Settings</CardTitle>
          <CardDescription>
            Configure your default chart preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="timeframe">Default Timeframe</Label>
            <Select 
              value={preferences.defaultTimeframe} 
              onValueChange={(value) => setPreferences({ ...preferences, defaultTimeframe: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map((timeframe) => (
                  <SelectItem key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Alerts</CardTitle>
          <CardDescription>
            Configure notifications for your trades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="tradeAlerts">Enable Trade Alerts</Label>
              <p className="text-sm text-gray-500">
                Get notified when trades hit TP/SL levels
              </p>
            </div>
            <Switch
              id="tradeAlerts"
              checked={preferences.tradeAlertsEnabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, tradeAlertsEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="alertSound">Alert Sound</Label>
              <p className="text-sm text-gray-500">
                Play sound when receiving alerts
              </p>
            </div>
            <Switch
              id="alertSound"
              checked={preferences.alertSoundEnabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, alertSoundEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-[#2AB7CA] hover:bg-[#2AB7CA]/90"
        >
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}

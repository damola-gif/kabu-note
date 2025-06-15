
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/contexts/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
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
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    currency: "USD",
    defaultTimeframe: "1d",
    tradeAlertsEnabled: true,
    alertSoundEnabled: true,
    riskManagement: true,
    autoCalculatePosition: false
  });

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const savedPreferences = localStorage.getItem(`trading_preferences_${user.id}`);
        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences);
          setPreferences(parsed);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save preferences');
      return;
    }

    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem(`trading_preferences_${user.id}`, JSON.stringify(preferences));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Trading preferences updated!");
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Failed to update preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-medium">Currency Settings</CardTitle>
          <CardDescription>
            Choose your preferred currency for displaying values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Currency</Label>
            <Select 
              value={preferences.currency} 
              onValueChange={(value) => updatePreference('currency', value)}
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
          <CardTitle className="font-medium">Chart Settings</CardTitle>
          <CardDescription>
            Configure your default chart preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="timeframe">Default Timeframe</Label>
            <Select 
              value={preferences.defaultTimeframe} 
              onValueChange={(value) => updatePreference('defaultTimeframe', value)}
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
          <CardTitle className="font-medium">Trade Alerts</CardTitle>
          <CardDescription>
            Configure notifications for your trades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="tradeAlerts">Enable Trade Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when trades hit TP/SL levels
              </p>
            </div>
            <Switch
              id="tradeAlerts"
              checked={preferences.tradeAlertsEnabled}
              onCheckedChange={(checked) => updatePreference('tradeAlertsEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="alertSound">Alert Sound</Label>
              <p className="text-sm text-muted-foreground">
                Play sound when receiving alerts
              </p>
            </div>
            <Switch
              id="alertSound"
              checked={preferences.alertSoundEnabled}
              onCheckedChange={(checked) => updatePreference('alertSoundEnabled', checked)}
              disabled={!preferences.tradeAlertsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle className="font-medium">Risk Management</CardTitle>
          <CardDescription>
            Configure risk management settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="riskManagement">Enable Risk Warnings</Label>
              <p className="text-sm text-muted-foreground">
                Show warnings for high-risk trades
              </p>
            </div>
            <Switch
              id="riskManagement"
              checked={preferences.riskManagement}
              onCheckedChange={(checked) => updatePreference('riskManagement', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoPosition">Auto Position Sizing</Label>
              <p className="text-sm text-muted-foreground">
                Automatically calculate position sizes
              </p>
            </div>
            <Switch
              id="autoPosition"
              checked={preferences.autoCalculatePosition}
              onCheckedChange={(checked) => updatePreference('autoCalculatePosition', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}

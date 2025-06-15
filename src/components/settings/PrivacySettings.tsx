
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/contexts/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Copy, ExternalLink } from "lucide-react";

export function PrivacySettings() {
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShares, setIsLoadingShares] = useState(true);
  const [privacy, setPrivacy] = useState({
    strategyVisibility: "followers",
    allowComments: true,
    allowFollows: true
  });
  const [publicShares, setPublicShares] = useState<any[]>([]);

  // Load privacy settings and public shares
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        // Load privacy settings from localStorage (in real app, would be from database)
        const savedPrivacy = localStorage.getItem(`privacy_settings_${user.id}`);
        if (savedPrivacy) {
          setPrivacy(JSON.parse(savedPrivacy));
        }

        // Load public strategies that are shared
        const { data: strategies, error } = await supabase
          .from('strategies')
          .select('id, name, created_at')
          .eq('user_id', user.id)
          .eq('is_public', true);

        if (error) {
          console.error('Error loading public strategies:', error);
        } else {
          setPublicShares(strategies || []);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoadingShares(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save privacy settings');
      return;
    }

    setIsLoading(true);
    try {
      // Save to localStorage (in real app, would save to database)
      localStorage.setItem(`privacy_settings_${user.id}`, JSON.stringify(privacy));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Privacy settings updated!");
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error("Failed to update privacy settings");
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = (strategyId: string) => {
    const shareUrl = `${window.location.origin}/strategy/${strategyId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  const makeStrategyPrivate = async (strategyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('strategies')
        .update({ is_public: false })
        .eq('id', strategyId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setPublicShares(prev => prev.filter(s => s.id !== strategyId));
      toast.success("Strategy made private");
    } catch (error) {
      console.error('Error making strategy private:', error);
      toast.error("Failed to make strategy private");
    }
  };

  const updatePrivacySetting = (key: string, value: any) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Strategy Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Visibility</CardTitle>
          <CardDescription>
            Control who can view your trading strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="visibility">Who can view my strategies?</Label>
            <Select 
              value={privacy.strategyVisibility} 
              onValueChange={(value) => updatePrivacySetting('strategyVisibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can view</SelectItem>
                <SelectItem value="followers">Followers Only</SelectItem>
                <SelectItem value="private">Private - Only me</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              This affects new strategies. Existing public strategies remain public until individually changed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Interaction */}
      <Card>
        <CardHeader>
          <CardTitle>Social Interaction</CardTitle>
          <CardDescription>
            Manage how others can interact with your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowComments">Allow Comments</Label>
              <p className="text-sm text-gray-500">
                Let others comment on your strategies
              </p>
            </div>
            <Switch
              id="allowComments"
              checked={privacy.allowComments}
              onCheckedChange={(checked) => updatePrivacySetting('allowComments', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowFollows">Allow Follows</Label>
              <p className="text-sm text-gray-500">
                Let other users follow your profile
              </p>
            </div>
            <Switch
              id="allowFollows"
              checked={privacy.allowFollows}
              onCheckedChange={(checked) => updatePrivacySetting('allowFollows', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Public Strategies Management */}
      <Card>
        <CardHeader>
          <CardTitle>Public Strategies</CardTitle>
          <CardDescription>
            Manage your publicly shared strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingShares ? (
            <p className="text-center py-4">Loading public strategies...</p>
          ) : publicShares.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No public strategies found
            </p>
          ) : (
            <div className="space-y-3">
              {publicShares.map((strategy) => (
                <div key={strategy.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{strategy.name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Shared {new Date(strategy.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyShareLink(strategy.id)}
                      title="Copy share link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/strategy/${strategy.id}`, '_blank')}
                      title="View strategy"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => makeStrategyPrivate(strategy.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Make private"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-[#2AB7CA] hover:bg-[#2AB7CA]/90"
        >
          {isLoading ? "Saving..." : "Save Privacy Settings"}
        </Button>
      </div>
    </div>
  );
}

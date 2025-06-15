
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Copy } from "lucide-react";

const publicLinks = [
  {
    id: 1,
    name: "Scalping Strategy #1",
    url: "https://kabuname.com/strategy/abc123",
    views: 245,
    created: "2024-12-01"
  },
  {
    id: 2,
    name: "Swing Trading Setup",
    url: "https://kabuname.com/strategy/def456",
    views: 89,
    created: "2024-11-28"
  }
];

export function PrivacySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [privacy, setPrivacy] = useState({
    strategyVisibility: "followers",
    allowComments: true,
    allowFollows: true
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement privacy settings save logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Privacy settings updated!");
    } catch (error) {
      toast.error("Failed to update privacy settings");
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const revokeAccess = (linkId: number) => {
    // TODO: Implement revoke access logic
    toast.success("Access revoked for this link");
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
              onValueChange={(value) => setPrivacy({ ...privacy, strategyVisibility: value })}
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
              onCheckedChange={(checked) => setPrivacy({ ...privacy, allowComments: checked })}
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
              onCheckedChange={(checked) => setPrivacy({ ...privacy, allowFollows: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Public Links Management */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Strategy Links</CardTitle>
          <CardDescription>
            Manage your publicly shared strategy links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publicLinks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No public links created yet
            </p>
          ) : (
            <div className="space-y-3">
              {publicLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{link.name}</p>
                    <p className="text-sm text-gray-500">{link.url}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {link.views} views
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Created {link.created}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLink(link.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeAccess(link.id)}
                      className="text-red-600 hover:text-red-700"
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

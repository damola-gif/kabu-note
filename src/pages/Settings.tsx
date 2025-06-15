
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { TradingPreferences } from "@/components/settings/TradingPreferences";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { DataExport } from "@/components/settings/DataExport";
import { DangerZone } from "@/components/settings/DangerZone";
import { 
  User, 
  Shield, 
  TrendingUp, 
  Eye, 
  Download, 
  Trash2 
} from "lucide-react";

const settingSections = [
  {
    id: "profile",
    title: "Profile Settings",
    icon: User,
    description: "Manage your personal information and profile",
    component: ProfileSettings
  },
  {
    id: "security",
    title: "Security & Login",
    icon: Shield,
    description: "Password, 2FA and connected accounts",
    component: SecuritySettings
  },
  {
    id: "trading",
    title: "Trading Preferences",
    icon: TrendingUp,
    description: "Currency, timeframes and trade alerts",
    component: TradingPreferences
  },
  {
    id: "privacy",
    title: "Privacy & Sharing",
    icon: Eye,
    description: "Control who can see your strategies",
    component: PrivacySettings
  },
  {
    id: "data",
    title: "Data & Export",
    icon: Download,
    description: "Export data and manage your information",
    component: DataExport
  },
  {
    id: "danger",
    title: "Danger Zone",
    icon: Trash2,
    description: "Delete account and clear data",
    component: DangerZone
  }
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const ActiveComponent = settingSections.find(s => s.id === activeSection)?.component || ProfileSettings;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E2A4E] mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and application preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation - Desktop */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {settingSections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <Button
                        key={section.id}
                        variant={activeSection === section.id ? "secondary" : "ghost"}
                        className={`w-full justify-start px-3 py-2 h-auto text-left ${
                          activeSection === section.id 
                            ? "bg-[#2AB7CA]/10 text-[#2AB7CA] border-r-2 border-[#2AB7CA]" 
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="font-medium text-sm truncate">{section.title}</div>
                            <div className="text-xs text-gray-500 leading-tight line-clamp-2">
                              {section.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#1E2A4E]">
                  {settingSections.find(s => s.id === activeSection)?.title}
                </CardTitle>
                <CardDescription>
                  {settingSections.find(s => s.id === activeSection)?.description}
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <ActiveComponent />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="border-x border-border min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account and application preferences</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-border">
              <div className="p-4">
                <nav className="space-y-1">
                  {settingSections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <Button
                        key={section.id}
                        variant={activeSection === section.id ? "secondary" : "ghost"}
                        className={`w-full justify-start items-start px-3 py-3 h-auto text-left gap-3 ${
                          activeSection === section.id 
                            ? "bg-muted text-foreground" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{section.title}</div>
                          <div className="text-xs text-muted-foreground leading-tight mt-0.5 break-words">
                            {section.description}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">
                  {settingSections.find(s => s.id === activeSection)?.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {settingSections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
              <Separator className="mb-6" />
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

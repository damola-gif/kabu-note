
import { User, Bell, Shield, Palette, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const settingsSections = [
  {
    title: "Profile Settings",
    icon: User,
    description: "Manage your account information and preferences",
    items: [
      "Personal Information",
      "Profile Picture", 
      "Username & Display Name",
      "Bio & Social Links"
    ]
  },
  {
    title: "Notifications",
    icon: Bell,
    description: "Control how you receive updates and alerts",
    items: [
      "Trade Alerts",
      "Social Activity",
      "Email Notifications",
      "Push Notifications"
    ]
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    description: "Manage your privacy and security settings",
    items: [
      "Privacy Settings",
      "Two-Factor Authentication",
      "Account Permissions",
      "Data Export"
    ]
  },
  {
    title: "Appearance",
    icon: Palette,
    description: "Customize how the app looks and feels",
    items: [
      "Theme Preference",
      "Language Settings",
      "Chart Preferences",
      "Dashboard Layout"
    ]
  }
];

const Settings = () => (
  <div className="space-y-8">
    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold text-[#1E2A4E]">Settings</h1>
      <p className="text-gray-600 mt-2">Manage your account and application preferences.</p>
    </div>

    {/* Settings Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {settingsSections.map((section) => {
        const IconComponent = section.icon;
        return (
          <div key={section.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[#2AB7CA]/10 rounded-lg">
                <IconComponent className="h-6 w-6 text-[#2AB7CA]" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1E2A4E] mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {section.description}
                </p>
                
                <ul className="space-y-2 mb-4">
                  {section.items.map((item) => (
                    <li key={item} className="text-sm text-gray-700 flex items-center">
                      <div className="w-1.5 h-1.5 bg-[#2AB7CA] rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#2AB7CA] text-[#2AB7CA] hover:bg-[#2AB7CA]/10"
                >
                  Configure
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Help Section */}
    <div className="bg-gradient-to-r from-[#1E2A4E] to-[#2AB7CA] p-6 rounded-xl text-white">
      <div className="flex items-center space-x-4">
        <HelpCircle className="h-8 w-8" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
          <p className="text-sm opacity-90 mb-4">
            Check out our documentation or contact support for assistance.
          </p>
          <div className="flex space-x-3">
            <Button variant="secondary" size="sm">
              Documentation
            </Button>
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Settings;

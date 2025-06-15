
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";

// Mock data - replace with real data
const mockActivities = [
  {
    id: "1",
    type: "like",
    message: "Your EUR/USD strategy received 3 new likes",
    timestamp: new Date("2024-01-15T10:30:00"),
    icon: Heart,
    iconColor: "text-red-500"
  },
  {
    id: "2", 
    type: "follower",
    message: "Sarah Chen started following you",
    timestamp: new Date("2024-01-15T09:15:00"),
    icon: Users,
    iconColor: "text-blue-500"
  },
  {
    id: "3",
    type: "comment",
    message: "New comment on your Swing Trading strategy",
    timestamp: new Date("2024-01-14T16:45:00"),
    icon: MessageCircle,
    iconColor: "text-green-500"
  },
  {
    id: "4",
    type: "published",
    message: "You published 'Breakout Trading Method'",
    timestamp: new Date("2024-01-14T14:20:00"),
    icon: TrendingUp,
    iconColor: "text-[#2AB7CA]"
  }
];

export function RecentActivity() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-[#1E2A4E] mb-6">Your Activity</h3>
      
      {mockActivities.length > 0 ? (
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <IconComponent className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(activity.timestamp, "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
}

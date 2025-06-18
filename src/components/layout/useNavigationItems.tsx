
import { useLocation } from 'react-router-dom';
import { Home, BarChart, TrendingUp, Users, MessageSquare, Bell, User, Settings, FileText } from 'lucide-react';

export function useNavigationItems() {
  const location = useLocation();

  return [
    {
      name: 'Home',
      path: '/home',
      icon: Home,
    },
    {
      name: 'Feed',
      path: '/feed',
      icon: MessageSquare,
    },
    {
      name: 'Strategies',
      path: '/strategies',
      icon: TrendingUp,
    },
    {
      name: 'Journal',
      path: '/journal',
      icon: FileText,
    },
    {
      name: 'Rooms',
      path: '/rooms',
      icon: Users,
    }
  ];
}

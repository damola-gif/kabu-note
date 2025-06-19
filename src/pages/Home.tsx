
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, FileText, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Trade Journal',
      description: 'Record and analyze your trades',
      icon: FileText,
      path: '/journal',
      color: 'text-blue-500'
    },
    {
      title: 'Strategies',
      description: 'Create and manage trading strategies',
      icon: TrendingUp,
      path: '/strategies',
      color: 'text-green-500'
    },
    {
      title: 'Community Feed',
      description: 'Connect with other traders',
      icon: MessageSquare,
      path: '/feed',
      color: 'text-purple-500'
    },
    {
      title: 'Trading Rooms',
      description: 'Join live trading discussions',
      icon: Users,
      path: '/rooms',
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to KabuTrade</h1>
        <p className="text-muted-foreground">Your complete trading companion</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card 
            key={action.title} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(action.path)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Track Your Trades</h3>
              <p className="text-sm text-muted-foreground">
                Start by recording your trades in the journal to track your performance.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/journal')}
              >
                Open Journal
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Share Strategies</h3>
              <p className="text-sm text-muted-foreground">
                Create and share your trading strategies with the community.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/strategies')}
              >
                View Strategies
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionProvider';

interface TraderProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

export function TraderSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useSession();

  const { data: traders = [], isLoading } = useQuery({
    queryKey: ['traderSearch', searchTerm],
    queryFn: async (): Promise<TraderProfile[]> => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  const handleTraderClick = (username: string) => {
    navigate(`/u/${username}`);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search traders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      {searchTerm.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : traders.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No traders found
              </div>
            ) : (
              <ul>
                {traders.map((trader) => (
                  <li
                    key={trader.id}
                    onClick={() => handleTraderClick(trader.username)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent cursor-pointer transition-colors border-b last:border-b-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={trader.avatar_url || ''} alt={trader.username} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {trader.full_name || trader.username}
                      </p>
                      {trader.full_name && (
                        <p className="text-sm text-muted-foreground truncate">
                          @{trader.username}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

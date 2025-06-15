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
    <div className="relative w-full max-w-xs md:max-w-[225px]">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search traders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 rounded-md text-xs h-8 md:h-9 bg-muted"
        />
      </div>
      {searchTerm.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 border bg-popover shadow-xl animate-fade-in">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-2 text-center text-xs text-muted-foreground">
                Searching...
              </div>
            ) : traders.length === 0 ? (
              <div className="p-2 text-center text-xs text-muted-foreground">
                No traders found
              </div>
            ) : (
              <ul>
                {traders.map((trader) => (
                  <li
                    key={trader.id}
                    onClick={() => handleTraderClick(trader.username)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer transition text-xs"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={trader.avatar_url || ''} alt={trader.username} />
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate">
                        {trader.full_name || trader.username}
                      </span>
                      {trader.full_name && (
                        <span className="ml-1 text-muted-foreground">@{trader.username}</span>
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

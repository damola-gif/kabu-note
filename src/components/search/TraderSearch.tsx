
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
    <div className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/60" />
        <Input
          type="text"
          placeholder="Search traders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-slate-900/60 border-slate-700/50 text-slate-200 placeholder-slate-400 focus:ring-cyan-400/50 focus:border-cyan-400/50 rounded-full"
        />
      </div>
      {searchTerm.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl shadow-black/20 border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-slate-400">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              </div>
            ) : traders.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">
                No traders found
              </div>
            ) : (
              <ul>
                {traders.map((trader) => (
                  <li
                    key={trader.id}
                    onClick={() => handleTraderClick(trader.username)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-cyan-400/10 cursor-pointer transition-all duration-200 border-b border-slate-700/30 last:border-b-0 group"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-slate-700/50 group-hover:ring-cyan-400/50 transition-all duration-200">
                      <AvatarImage src={trader.avatar_url || ''} alt={trader.username} />
                      <AvatarFallback className="bg-slate-800 text-slate-300">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-slate-200 group-hover:text-cyan-400 transition-colors duration-200">
                        {trader.full_name || trader.username}
                      </p>
                      {trader.full_name && (
                        <p className="text-sm text-slate-400 truncate">
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

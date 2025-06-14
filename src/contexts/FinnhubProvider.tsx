
import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { FINNHUB_API_KEY } from '@/config';
import { toast } from "sonner";

type PriceCallback = (price: number, symbol: string) => void;

interface FinnhubContextType {
  subscribe: (symbol: string, callback: PriceCallback) => void;
  unsubscribe: (symbol: string, callback: PriceCallback) => void;
  isConnected: boolean;
}

const FinnhubContext = createContext<FinnhubContextType | undefined>(undefined);

export const FinnhubProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // Using Map and Set for callbacks for better performance and cleaner code.
  const subscriptions = useRef<Map<string, Set<PriceCallback>>>(new Map());

  useEffect(() => {
    // Ensure the API key is set in src/config.ts before attempting to connect.
    if (FINNHUB_API_KEY.startsWith('YOUR_') || !FINNHUB_API_KEY) {
      console.warn("Finnhub API key not set in src/config.ts. Real-time features will be disabled.");
      toast.warning("Please set your Finnhub API key in src/config.ts");
      return;
    }

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);
    socket.current = ws;

    ws.onopen = () => {
      console.log("Finnhub WebSocket connected");
      setIsConnected(true);
      // Resubscribe to all symbols that had subscriptions.
      subscriptions.current.forEach((cbs, symbol) => {
        if (cbs.size > 0) {
          ws.send(JSON.stringify({ type: 'subscribe', symbol }));
        }
      });
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'trade' && message.data) {
        message.data.forEach((trade: { s: string, p: number }) => {
            const { s: symbol, p: price } = trade;
            const cbs = subscriptions.current.get(symbol);
            if (cbs) {
                cbs.forEach(callback => callback(price, symbol));
            }
        });
      } else if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    };

    ws.onclose = () => {
      console.log("Finnhub WebSocket disconnected.");
      setIsConnected(false);
      socket.current = null;
      // Note: Automatic reconnection has been removed to simplify debugging.
    };

    ws.onerror = (error) => {
      console.error("Finnhub WebSocket error:", error);
      toast.error("Could not connect to live price feed. Check your API key and network.");
      setIsConnected(false);
      ws.close();
    };
    
    // Cleanup on component unmount
    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, []); // Run only once on mount

  const subscribe = useCallback((symbol: string, callback: PriceCallback) => {
    const upperSymbol = symbol.toUpperCase();
    if (!subscriptions.current.has(upperSymbol)) {
      subscriptions.current.set(upperSymbol, new Set());
    }
    
    const cbs = subscriptions.current.get(upperSymbol)!;
    const wasEmpty = cbs.size === 0;

    cbs.add(callback);

    if (wasEmpty && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ type: 'subscribe', symbol: upperSymbol }));
    }
  }, []);

  const unsubscribe = useCallback((symbol: string, callback: PriceCallback) => {
    const upperSymbol = symbol.toUpperCase();
    const cbs = subscriptions.current.get(upperSymbol);

    if (!cbs) return;

    cbs.delete(callback);

    if (cbs.size === 0) {
      subscriptions.current.delete(upperSymbol);
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ type: 'unsubscribe', symbol: upperSymbol }));
      }
    }
  }, []);

  const value = { subscribe, unsubscribe, isConnected };

  return (
    <FinnhubContext.Provider value={value}>
      {children}
    </FinnhubContext.Provider>
  );
};

export const useFinnhub = () => {
  const context = useContext(FinnhubContext);
  if (context === undefined) {
    throw new Error('useFinnhub must be used within a FinnhubProvider');
  }
  return context;
};


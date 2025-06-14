
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
  const subscriptions = useRef<Record<string, PriceCallback[]>>({});

  const connect = useCallback(() => {
    if (socket.current || FINNHUB_API_KEY.startsWith('YOUR_')) {
      if (FINNHUB_API_KEY.startsWith('YOUR_')) {
        console.warn("Finnhub API key not set in src/config.ts. Real-time features will be disabled.");
      }
      return;
    }

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);
    socket.current = ws;

    ws.onopen = () => {
      console.log("Finnhub WebSocket connected");
      setIsConnected(true);
      // Resubscribe to all symbols
      Object.keys(subscriptions.current).forEach(symbol => {
        if (subscriptions.current[symbol].length > 0) {
          ws.send(JSON.stringify({ type: 'subscribe', symbol }));
        }
      });
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'trade' && message.data) {
        message.data.forEach((trade: { s: string, p: number }) => {
            const { s: symbol, p: price } = trade;
            if (subscriptions.current[symbol]) {
                subscriptions.current[symbol].forEach(callback => callback(price, symbol));
            }
        });
      } else if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    };

    ws.onclose = () => {
      console.log("Finnhub WebSocket disconnected. Reconnecting...");
      setIsConnected(false);
      socket.current = null;
      setTimeout(connect, 5000); // Reconnect after 5 seconds
    };

    ws.onerror = (error) => {
      console.error("Finnhub WebSocket error:", error);
      toast.error("Could not connect to live price feed.");
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, [connect]);

  const subscribe = useCallback((symbol: string, callback: PriceCallback) => {
    const upperSymbol = symbol.toUpperCase();
    const cbs = subscriptions.current[upperSymbol] || [];
    if (cbs.length === 0 && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ type: 'subscribe', symbol: upperSymbol }));
    }
    subscriptions.current[upperSymbol] = [...cbs, callback];
  }, []);

  const unsubscribe = useCallback((symbol: string, callback: PriceCallback) => {
    const upperSymbol = symbol.toUpperCase();
    const cbs = subscriptions.current[upperSymbol] || [];
    const newCbs = cbs.filter(cb => cb !== callback);
    subscriptions.current[upperSymbol] = newCbs;

    if (newCbs.length === 0 && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ type: 'unsubscribe', symbol: upperSymbol }));
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

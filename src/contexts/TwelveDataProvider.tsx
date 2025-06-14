
import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { TWELVE_DATA_API_KEY } from '@/config';
import { toast } from "sonner";

type PriceCallback = (price: number, symbol: string) => void;

interface TwelveDataContextType {
  subscribe: (symbol: string, callback: PriceCallback) => void;
  unsubscribe: (symbol: string, callback: PriceCallback) => void;
  isConnected: boolean;
}

const TwelveDataContext = createContext<TwelveDataContextType | undefined>(undefined);

export const TwelveDataProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptions = useRef<Map<string, Set<PriceCallback>>>(new Map());

  useEffect(() => {
    if (TWELVE_DATA_API_KEY.startsWith('YOUR_') || !TWELVE_DATA_API_KEY) {
      console.warn("Twelve Data API key not set in src/config.ts. Real-time features will be disabled.");
      toast.warning("Please set your Twelve Data API key in src/config.ts");
      return;
    }

    const ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${TWELVE_DATA_API_KEY}`);
    socket.current = ws;

    ws.onopen = () => {
      console.log("Twelve Data WebSocket connected");
      setIsConnected(true);
      // When we connect, re-subscribe to all symbols we were watching
      const symbols = Array.from(subscriptions.current.keys());
      if (symbols.length > 0) {
        ws.send(JSON.stringify({
            action: 'subscribe',
            params: { symbols: symbols.join(',') }
        }));
      }
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.event === 'price' && message.symbol && message.price) {
        const { symbol, price } = message;
        const cbs = subscriptions.current.get(symbol);
        if (cbs) {
            cbs.forEach(callback => callback(price, symbol));
        }
      } else if (message.event === 'heartbeat') {
        // console.log('Twelve Data heartbeat'); // Can be noisy
      } else if (message.event === 'subscribe-status') {
        console.log('Twelve Data subscription status:', message);
      }
    };

    ws.onclose = () => {
      console.log("Twelve Data WebSocket disconnected.");
      setIsConnected(false);
      socket.current = null;
    };

    ws.onerror = (error) => {
      console.error("Twelve Data WebSocket error:", error);
      toast.error("Could not connect to live price feed. Check your API key and network.");
      setIsConnected(false);
      ws.close();
    };
    
    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, []);

  const subscribe = useCallback((symbol: string, callback: PriceCallback) => {
    const upperSymbol = symbol.toUpperCase();
    if (!subscriptions.current.has(upperSymbol)) {
      subscriptions.current.set(upperSymbol, new Set());
      // If this is a new symbol, send a subscribe message
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({
            action: 'subscribe',
            params: { symbols: upperSymbol }
        }));
      }
    }
    subscriptions.current.get(upperSymbol)!.add(callback);
  }, []);

  const unsubscribe = useCallback((symbol: string, callback: PriceCallback) => {
    const upperSymbol = symbol.toUpperCase();
    const cbs = subscriptions.current.get(upperSymbol);

    if (!cbs) return;

    cbs.delete(callback);

    if (cbs.size === 0) {
      subscriptions.current.delete(upperSymbol);
      // If it's the last callback, unsubscribe from the symbol
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({
            action: 'unsubscribe',
            params: { symbols: upperSymbol }
        }));
      }
    }
  }, []);

  const value = { subscribe, unsubscribe, isConnected };

  return (
    <TwelveDataContext.Provider value={value}>
      {children}
    </TwelveDataContext.Provider>
  );
};

export const useTwelveData = () => {
  const context = useContext(TwelveDataContext);
  if (context === undefined) {
    throw new Error('useTwelveData must be used within a TwelveDataProvider');
  }
  return context;
};

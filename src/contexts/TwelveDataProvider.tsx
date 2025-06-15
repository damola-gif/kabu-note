
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connectWebSocket = useCallback(() => {
    if (TWELVE_DATA_API_KEY.startsWith('YOUR_') || !TWELVE_DATA_API_KEY) {
      console.warn("Twelve Data API key not set in src/config.ts. Real-time features will be disabled.");
      return;
    }

    try {
      const ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${TWELVE_DATA_API_KEY}`);
      socket.current = ws;

      ws.onopen = () => {
        console.log("Twelve Data WebSocket connected");
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
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
        try {
          const message = JSON.parse(event.data);
          
          if (message.event === 'price' && message.symbol && message.price) {
            const { symbol, price } = message;
            const cbs = subscriptions.current.get(symbol);
            if (cbs) {
                cbs.forEach(callback => callback(parseFloat(price), symbol));
            }
          } else if (message.event === 'heartbeat') {
            // console.log('Twelve Data heartbeat'); // Can be noisy
          } else if (message.event === 'subscribe-status') {
            console.log('Twelve Data subscription status:', message);
            if (message.status === 'ok') {
              setIsConnected(true);
            }
          } else if (message.event === 'error') {
            console.error('Twelve Data API error:', message);
            if (message.code === 401) {
              toast.error("Invalid Twelve Data API key. Please check your configuration.");
            } else if (message.code === 429) {
              toast.error("Twelve Data API rate limit exceeded. Real-time data temporarily unavailable.");
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log("Twelve Data WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
        setIsConnected(false);
        socket.current = null;
        
        // Auto-reconnect with exponential backoff (max 3 attempts)
        if (reconnectAttempts.current < 3) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s
          reconnectAttempts.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect to Twelve Data (attempt ${reconnectAttempts.current})`);
            connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error("Twelve Data WebSocket error:", error);
        setIsConnected(false);
      };
      
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, [connectWebSocket]);

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

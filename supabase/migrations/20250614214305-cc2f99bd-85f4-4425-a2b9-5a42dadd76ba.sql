
-- Create an enum type for trade side
CREATE TYPE public.trade_side AS ENUM ('long', 'short');

-- Create a table for trades
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side public.trade_side NOT NULL,
  size NUMERIC NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  pnl NUMERIC,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to update the 'updated_at' column automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to execute the function before an update
CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE
  ON public.trades
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Enable Row Level Security (RLS) on the trades table
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own trades
CREATE POLICY "Users can view their own trades"
  ON public.trades
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own trades
CREATE POLICY "Users can create their own trades"
  ON public.trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own trades
CREATE POLICY "Users can update their own trades"
  ON public.trades
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own trades
CREATE POLICY "Users can delete their own trades"
  ON public.trades
  FOR DELETE
  USING (auth.uid() = user_id);

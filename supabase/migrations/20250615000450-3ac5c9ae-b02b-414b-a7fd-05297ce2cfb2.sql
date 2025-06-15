
-- Add a 'win_rate' column to the strategies table to store performance metrics.
ALTER TABLE public.strategies
ADD COLUMN win_rate NUMERIC;

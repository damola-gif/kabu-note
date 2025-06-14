
ALTER TABLE public.trades
ADD COLUMN stop_loss numeric,
ADD COLUMN take_profit numeric,
ADD COLUMN closing_notes text;

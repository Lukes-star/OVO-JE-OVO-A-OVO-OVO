
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_token text;
UPDATE public.orders SET cancel_token = encode(gen_random_bytes(16), 'hex') WHERE cancel_token IS NULL;
ALTER TABLE public.orders ALTER COLUMN cancel_token SET NOT NULL;
ALTER TABLE public.orders ALTER COLUMN cancel_token SET DEFAULT encode(gen_random_bytes(16), 'hex');
CREATE UNIQUE INDEX IF NOT EXISTS orders_cancel_token_idx ON public.orders(cancel_token);

CREATE OR REPLACE FUNCTION public.cancel_order_by_token(_token text)
RETURNS TABLE(id uuid, status order_status, customer_name text, total numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.orders o
  SET status = 'otkazano'
  WHERE o.cancel_token = _token
    AND o.status IN ('na_cekanju','poslato')
  RETURNING o.id, o.status, o.customer_name, o.total;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_order_by_token(_token text)
RETURNS TABLE(id uuid, status order_status, customer_name text, total numeric, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.status, o.customer_name, o.total, o.created_at
  FROM public.orders o WHERE o.cancel_token = _token LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_order_by_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_by_token(text) TO anon, authenticated;

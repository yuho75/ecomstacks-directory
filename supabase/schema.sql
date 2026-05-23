-- Create items table with the specified fields
-- status check constraint ensures only pending, approved, or rejected values are stored.
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending_payment', 'pending', 'approved', 'rejected')),
    tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard', 'featured', 'premium')),
    paypal_order_id TEXT UNIQUE,
    edit_token TEXT,
    edit_token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone (unauthenticated/public) to select only 'approved' items
CREATE POLICY "Allow public read of approved items" 
ON public.items
FOR SELECT 
TO public
USING (status = 'approved');

-- Create policy to allow service_role / authenticated service to do everything
-- Note: Supabase service_role key automatically bypasses RLS, but having an explicit policy is safe.
CREATE POLICY "Allow service_role full access"
ON public.items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Indexing for quick lookups by status (important for ISR and public landing page)
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_items_paypal_order_id ON public.items(paypal_order_id);

-- Create subscribers table for Newsletter
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to subscribers"
ON public.subscribers
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow service_role full access to subscribers"
ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

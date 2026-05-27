-- Run this in the Supabase SQL Editor to create the reviews table

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id uuid NOT NULL,
  author text NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now()
);

-- Index for faster queries when looking up reviews for a specific item
CREATE INDEX IF NOT EXISTS idx_reviews_item_id ON public.reviews(item_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved reviews
CREATE POLICY "Anyone can read approved reviews" ON public.reviews
  FOR SELECT USING (status = 'approved');

-- Allow anyone to insert pending reviews (for the API route fallback, if using anon key)
-- Note: the actual submission API route uses service_role key, so this policy is optional,
-- but good to have if we ever use the client supabase instance directly.
CREATE POLICY "Anyone can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);

-- Add image_urls column to products for multiple image support
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Backfill existing products: if they have an image_url, add it to image_urls
UPDATE public.products
  SET image_urls = ARRAY[image_url]
  WHERE image_url IS NOT NULL AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

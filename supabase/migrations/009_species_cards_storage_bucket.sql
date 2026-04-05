-- Public bucket for directory species card images (WebP, optional PNG).
-- Uploads use the service role from scripts; reads are public for the marketing site + OG tags.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'species-cards',
  'species-cards',
  true,
  10485760,
  ARRAY['image/webp', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "species_cards_public_read" ON storage.objects;

CREATE POLICY "species_cards_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'species-cards');

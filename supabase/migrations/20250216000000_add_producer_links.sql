-- Add producer_links column to species table (comma-separated URLs matching producers order)
ALTER TABLE species
ADD COLUMN IF NOT EXISTS producer_links text;

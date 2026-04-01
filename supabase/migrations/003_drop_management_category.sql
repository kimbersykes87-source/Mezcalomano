-- Remove management_category column
alter table public.species drop column if exists management_category;

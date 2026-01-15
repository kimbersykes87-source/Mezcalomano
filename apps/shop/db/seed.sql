INSERT OR IGNORE INTO products (
  id,
  name,
  description,
  hs_code,
  weight_grams,
  width_in,
  height_in,
  depth_in,
  origin_country,
  is_active,
  created_at,
  updated_at
) VALUES (
  'prod_discovery_deck',
  'Mezcalomano - Discovery Deck',
  'A curated 54-card deck celebrating mezcal culture, tasting notes, and cocktail inspiration.',
  '9504400000',
  150,
  '2.75',
  '3.75',
  '0.75',
  'US',
  1,
  (unixepoch() * 1000),
  (unixepoch() * 1000)
);

INSERT OR IGNORE INTO prices (
  id,
  product_id,
  currency,
  unit_amount,
  is_active,
  created_at
) VALUES (
  'price_discovery_deck_usd',
  'prod_discovery_deck',
  'USD',
  3999,
  1,
  (unixepoch() * 1000)
);

INSERT OR IGNORE INTO inventory (
  id,
  product_id,
  on_hand,
  reserved,
  updated_at
) VALUES (
  'inv_discovery_deck',
  'prod_discovery_deck',
  0,
  0,
  (unixepoch() * 1000)
);

INSERT OR IGNORE INTO shipping_zones (
  id,
  name,
  countries_csv,
  is_active,
  created_at
) VALUES
  ('zone_us', 'United States', 'US', 1, (unixepoch() * 1000)),
  ('zone_intl', 'International', '*', 1, (unixepoch() * 1000));

INSERT OR IGNORE INTO shipping_rates (
  id,
  zone_id,
  service_level,
  currency,
  amount,
  min_days,
  max_days,
  is_active,
  created_at
) VALUES
  ('rate_us_standard_free', 'zone_us', 'standard', 'USD', 0, 3, 7, 1, (unixepoch() * 1000)),
  ('rate_intl_standard', 'zone_intl', 'standard', 'USD', 1500, 7, 14, 1, (unixepoch() * 1000)),
  ('rate_intl_express', 'zone_intl', 'express', 'USD', 3000, 3, 7, 1, (unixepoch() * 1000));

-- 0002_products_catalog.sql
-- Product catalog for the public site and admin product management.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  slug text not null unique,
  description text not null,
  features text[] not null default '{}'::text[],
  npk text not null,
  application text not null,
  coverage text not null,
  price text not null,
  image_key text not null default 'specialty' check (image_key in ('organic', 'liquid', 'specialty')),
  icon_key text not null default 'sprout' check (icon_key in ('leaf', 'droplets', 'sprout')),
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true
);

create index products_sort_order_idx on public.products (sort_order);
create index products_is_active_idx on public.products (is_active);
create index products_is_featured_idx on public.products (is_featured);

alter table public.products enable row level security;

create policy "anon can read active products"
  on public.products for select
  to anon
  using (is_active = true);

create policy "authenticated can read products"
  on public.products for select
  to authenticated
  using (true);

create policy "authenticated can insert products"
  on public.products for insert
  to authenticated
  with check (true);

create policy "authenticated can update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete products"
  on public.products for delete
  to authenticated
  using (true);

insert into public.products (
  name,
  slug,
  description,
  features,
  npk,
  application,
  coverage,
  price,
  image_key,
  icon_key,
  sort_order,
  is_featured,
  is_active
) values
  (
    'NPK 20-20-20',
    'npk-20-20-20',
    'Balanced all-purpose fertilizer ideal for general crop nutrition and greenhouse applications.',
    array[
      'Equal NPK ratio for balanced growth',
      'Water soluble formula',
      'Suitable for all crops',
      'Quick nutrient release',
      'Versatile application methods'
    ]::text[],
    '20-20-20',
    'Foliar spray or fertigation',
    '25 lbs per acre',
    '$42/bag (25kg)',
    'specialty',
    'sprout',
    10,
    true,
    true
  ),
  (
    'Urea (46-0-0)',
    'urea-46-0-0',
    'High nitrogen fertilizer for rapid vegetative growth and greening of crops.',
    array[
      '46% nitrogen content',
      'Cost-effective solution',
      'Fast-acting nitrogen source',
      'Increases protein content',
      'Promotes leafy growth'
    ]::text[],
    '46-0-0',
    'Broadcast or top dressing',
    '40 lbs per acre',
    '$28/bag (50kg)',
    'organic',
    'leaf',
    20,
    true,
    true
  ),
  (
    'DAP (18-46-0)',
    'dap-18-46-0',
    'Diammonium Phosphate for strong root development and early plant establishment.',
    array[
      'High phosphorus content',
      'Excellent for root growth',
      'Ideal for planting season',
      'Improves seedling vigor',
      'Long-lasting phosphate source'
    ]::text[],
    '18-46-0',
    'Band or broadcast at planting',
    '35 lbs per acre',
    '$38/bag (50kg)',
    'specialty',
    'sprout',
    30,
    true,
    true
  ),
  (
    'Muriate of Potash (0-0-60)',
    'muriate-of-potash-0-0-60',
    'Premium potassium fertilizer for fruit development and disease resistance.',
    array[
      '60% potassium content',
      'Enhances fruit quality',
      'Improves stress tolerance',
      'Increases crop yield',
      'Boosts disease resistance'
    ]::text[],
    '0-0-60',
    'Broadcast or side dressing',
    '30 lbs per acre',
    '$32/bag (50kg)',
    'liquid',
    'droplets',
    40,
    false,
    true
  ),
  (
    'Organic Compost Blend',
    'organic-compost-blend',
    '100% natural organic fertilizer enriched with beneficial microorganisms.',
    array[
      '100% natural ingredients',
      'Improves soil structure',
      'Rich in organic matter',
      'Slow-release nutrients',
      'Environmentally safe'
    ]::text[],
    '5-3-2',
    'Broadcast or incorporation',
    '2 tons per acre',
    '$25/bag (40kg)',
    'organic',
    'leaf',
    50,
    false,
    true
  ),
  (
    'NPK 15-15-15',
    'npk-15-15-15',
    'Complete balanced fertilizer for all-season crop nutrition and maintenance.',
    array[
      'Balanced nutrition profile',
      'Suitable for most crops',
      'Consistent nutrient release',
      'Easy to apply',
      'All-purpose formula'
    ]::text[],
    '15-15-15',
    'Broadcast or banding',
    '40 lbs per acre',
    '$35/bag (50kg)',
    'specialty',
    'sprout',
    60,
    false,
    true
  ),
  (
    'Liquid NPK 10-5-5',
    'liquid-npk-10-5-5',
    'Fast-acting liquid fertilizer for immediate nutrient uptake and quick results.',
    array[
      'Instant absorption',
      'Perfect for foliar feeding',
      'Water soluble concentrate',
      'Precise dosing control',
      'Rapid green-up effect'
    ]::text[],
    '10-5-5',
    'Foliar spray or drip irrigation',
    '1 liter per 200 sq ft',
    '$45/gallon (5L)',
    'liquid',
    'droplets',
    70,
    false,
    true
  ),
  (
    'Calcium Nitrate',
    'calcium-nitrate',
    'Premium calcium and nitrogen source for preventing blossom end rot and calcium deficiency.',
    array[
      'Dual calcium-nitrogen source',
      'Prevents calcium deficiency',
      'Water soluble',
      'Improves fruit firmness',
      'Reduces plant stress'
    ]::text[],
    '15.5-0-0 + 19% Ca',
    'Fertigation or foliar spray',
    '20 lbs per acre',
    '$48/bag (25kg)',
    'organic',
    'leaf',
    80,
    false,
    true
  ),
  (
    'Micronutrient Mix',
    'micronutrient-mix',
    'Complete micronutrient blend containing zinc, iron, manganese, and boron.',
    array[
      'Essential trace elements',
      'Prevents micronutrient deficiency',
      'Chelated for better absorption',
      'Improves crop quality',
      'Compatible with most fertilizers'
    ]::text[],
    'Zn, Fe, Mn, B, Cu, Mo',
    'Foliar or soil application',
    '5 lbs per acre',
    '$65/bag (10kg)',
    'specialty',
    'sprout',
    90,
    false,
    true
  );

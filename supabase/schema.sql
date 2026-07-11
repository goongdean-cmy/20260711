create table if not exists saju_draws (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  birth_date date not null,
  birth_time text,
  gender text,
  year_pillar text not null,
  month_pillar text not null,
  day_pillar text not null,
  time_pillar text,
  elements jsonb not null,
  dominant_element text not null,
  interpretation text,
  main_numbers int[] not null,
  bonus_number int not null
);

alter table saju_draws enable row level security;

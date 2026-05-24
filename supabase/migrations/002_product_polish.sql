alter table public.decisions
  add column if not exists minimum_information text not null default '',
  add column if not exists reversible_option text not null default '',
  add column if not exists do_nothing_cost text not null default '',
  add column if not exists fifteen_minute_action text not null default '',
  add column if not exists outcome_quality text check (outcome_quality in ('good', 'okay', 'bad')),
  add column if not exists confidence_after integer check (confidence_after between 1 and 5),
  add column if not exists lesson_learned text not null default '';

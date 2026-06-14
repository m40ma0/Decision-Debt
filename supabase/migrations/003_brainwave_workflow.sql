do $$
begin
  create type public.decision_workflow_stage as enum (
    'captured',
    'under_review',
    'owner_assigned',
    'resolved',
    'outcome_reviewed'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.decisions
  add column if not exists workflow_stage public.decision_workflow_stage not null default 'captured',
  add column if not exists workspace text not null default '',
  add column if not exists project text not null default '',
  add column if not exists owner text not null default '',
  add column if not exists tags text[] not null default '{}',
  add column if not exists affected_stakeholders integer not null default 0;

create index if not exists decisions_user_workflow_stage_idx
  on public.decisions(user_id, workflow_stage);


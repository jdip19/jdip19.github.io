create table if not exists public.i2snatcher_users (
  client_id text primary key,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'blocked')),
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create table if not exists public.i2snatcher_stats (
  singleton boolean primary key default true check (singleton),
  copied bigint not null default 0 check (copied >= 0),
  downloaded bigint not null default 0 check (downloaded >= 0)
);

insert into public.i2snatcher_stats (singleton)
values (true)
on conflict (singleton) do nothing;

create table if not exists public.i2snatcher_usage_events (
  event_id uuid primary key,
  client_id text not null references public.i2snatcher_users (client_id),
  action text not null check (action in ('copied', 'downloaded')),
  created_at timestamptz not null default now()
);

alter table public.i2snatcher_users enable row level security;
alter table public.i2snatcher_stats enable row level security;
alter table public.i2snatcher_usage_events enable row level security;

revoke all on public.i2snatcher_users from anon, authenticated;
revoke all on public.i2snatcher_stats from anon, authenticated;
revoke all on public.i2snatcher_usage_events from anon, authenticated;
grant all on public.i2snatcher_users to service_role;
grant all on public.i2snatcher_stats to service_role;
grant all on public.i2snatcher_usage_events to service_role;

create or replace function public.record_i2snatcher_usage(
  p_client_id text,
  p_event_id uuid,
  p_action text
)
returns table (copied bigint, downloaded bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_action not in ('copied', 'downloaded') then
    raise exception 'Invalid usage action';
  end if;

  if not exists (
    select 1
    from public.i2snatcher_users
    where client_id = p_client_id and status = 'approved'
  ) then
    raise exception 'User is not approved';
  end if;

  insert into public.i2snatcher_usage_events (event_id, client_id, action)
  values (p_event_id, p_client_id, p_action)
  on conflict (event_id) do nothing;

  if found then
    update public.i2snatcher_stats
    set copied = copied + case when p_action = 'copied' then 1 else 0 end,
        downloaded = downloaded + case when p_action = 'downloaded' then 1 else 0 end
    where singleton = true;
  end if;

  return query
  select stats.copied, stats.downloaded
  from public.i2snatcher_stats as stats
  where stats.singleton = true;
end;
$$;

revoke all on function public.record_i2snatcher_usage(text, uuid, text)
  from public, anon, authenticated;
grant execute on function public.record_i2snatcher_usage(text, uuid, text)
  to service_role;

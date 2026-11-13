alter table public.i2snatcher_users
  add column if not exists approved smallint not null default 0
    check (approved in (0, 1));

update public.i2snatcher_users
set approved = case when status = 'approved' then 1 else 0 end;

alter table public.i2snatcher_users
  drop column status;

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
    where client_id = p_client_id and approved = 1
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

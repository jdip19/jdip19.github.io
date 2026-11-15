create or replace function public.record_i2snatcher_usage_batch(
  p_client_id text,
  p_events jsonb
)
returns table (copied bigint, downloaded bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  copied_delta bigint;
  downloaded_delta bigint;
begin
  if p_events is null
    or jsonb_typeof(p_events) <> 'array'
    or jsonb_array_length(p_events) < 1
    or jsonb_array_length(p_events) > 100 then
    raise exception 'Invalid usage event batch';
  end if;

  if not exists (
    select 1
    from public.i2snatcher_users
    where client_id = p_client_id and approved = 1
  ) then
    raise exception 'User is not approved';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_events) as event(event_id uuid, action text)
    where event.event_id is null
      or event.action not in ('copied', 'downloaded')
  ) then
    raise exception 'Invalid usage event';
  end if;

  with inserted_events as (
    insert into public.i2snatcher_usage_events (event_id, client_id, action)
    select event.event_id, p_client_id, event.action
    from jsonb_to_recordset(p_events) as event(event_id uuid, action text)
    on conflict (event_id) do nothing
    returning action
  )
  select
    count(*) filter (where action = 'copied'),
    count(*) filter (where action = 'downloaded')
  into copied_delta, downloaded_delta
  from inserted_events;

  update public.i2snatcher_stats
  set copied = copied + copied_delta,
      downloaded = downloaded + downloaded_delta
  where singleton = true;

  return query
  select stats.copied, stats.downloaded
  from public.i2snatcher_stats as stats
  where stats.singleton = true;
end;
$$;

revoke all on function public.record_i2snatcher_usage_batch(text, jsonb)
  from public, anon, authenticated;
grant execute on function public.record_i2snatcher_usage_batch(text, jsonb)
  to service_role;

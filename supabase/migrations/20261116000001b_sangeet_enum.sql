-- Add 'sangeet' to event_type enum in its own transaction before 20261116000002 uses it
do $$
begin
  alter type public.event_type add value if not exists 'sangeet' after 'mehendi';
exception
  when duplicate_object then null;
end $$;

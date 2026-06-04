-- Run AFTER schema.sql if you signed up before tables existed.
-- Creates empty profile + settings rows for every auth user missing them.

insert into public.profiles (user_id, email, full_name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
where not exists (
  select 1 from public.profiles p where p.user_id = u.id
);

insert into public.user_settings (user_id)
select u.id
from auth.users u
where not exists (
  select 1 from public.user_settings s where s.user_id = u.id
);

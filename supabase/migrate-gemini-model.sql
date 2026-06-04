-- Run once in Supabase SQL Editor if generation still calls gemini-2.0-flash
update public.user_settings
set preferred_model = 'gemini-2.5-flash'
where preferred_model in (
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-pro',
  'gemini-1.5-flash'
);

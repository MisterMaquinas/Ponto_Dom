-- Ensure a Master admin exists with the requested credentials
-- Remove any existing duplicates to avoid multiple rows
DELETE FROM public.admins WHERE username = 'Master';

INSERT INTO public.admins (username, password)
VALUES ('Master', 'Master123#');
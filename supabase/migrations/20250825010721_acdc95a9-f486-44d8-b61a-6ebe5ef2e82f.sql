-- Enable RLS on access_keys table (had policies but RLS was disabled)
ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;
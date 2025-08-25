-- Allow anonymous company creation to fix RLS violation
CREATE POLICY IF NOT EXISTS "Anyone can create companies"
ON public.companies
FOR INSERT
WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'companies' 
      AND policyname = 'Anyone can create companies'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can create companies" ON public.companies FOR INSERT WITH CHECK (true)';
  END IF;
END $$;
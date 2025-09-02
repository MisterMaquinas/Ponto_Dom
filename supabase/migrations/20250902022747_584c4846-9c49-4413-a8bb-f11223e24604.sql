-- Add missing columns to branches table
ALTER TABLE public.branches 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS contact text;

-- Update the generate_company_access_key function to generate better keys
CREATE OR REPLACE FUNCTION public.generate_company_access_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := 'EMP-';
    i INTEGER;
BEGIN
    FOR i IN 1..16 LOOP
        IF i > 1 AND (i - 1) % 4 = 0 THEN
            result := result || '-';
        END IF;
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$;
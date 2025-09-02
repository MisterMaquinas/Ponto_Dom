-- Fix security issues: Set proper search_path for functions
CREATE OR REPLACE FUNCTION generate_company_access_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        IF i > 1 AND (i - 1) % 4 = 0 THEN
            result := result || '-';
        END IF;
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION create_company_access_key()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO access_keys (company_id, key_value, description, is_active)
    VALUES (NEW.id, generate_company_access_key(), 'Chave de acesso da empresa', true);
    RETURN NEW;
END;
$$;
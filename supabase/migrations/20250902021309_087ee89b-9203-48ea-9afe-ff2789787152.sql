-- Remove duplicate access keys, keeping only the first one per company
DELETE FROM access_keys a1 
WHERE EXISTS (
    SELECT 1 FROM access_keys a2 
    WHERE a2.company_id = a1.company_id 
    AND a2.created_at < a1.created_at
);

-- Now add the unique constraint
ALTER TABLE access_keys ADD CONSTRAINT unique_company_key UNIQUE (company_id);

-- Create function to generate access key
CREATE OR REPLACE FUNCTION generate_company_access_key()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to create access key for company
CREATE OR REPLACE FUNCTION create_company_access_key()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO access_keys (company_id, key_value, description, is_active)
    VALUES (NEW.id, generate_company_access_key(), 'Chave de acesso da empresa', true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate access key when company is created
CREATE TRIGGER trigger_create_company_access_key
    AFTER INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION create_company_access_key();

-- Generate access keys for existing companies that don't have one
INSERT INTO access_keys (company_id, key_value, description, is_active)
SELECT 
    c.id,
    generate_company_access_key(),
    'Chave de acesso da empresa',
    true
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM access_keys ak WHERE ak.company_id = c.id
)
ON CONFLICT (company_id) DO NOTHING;
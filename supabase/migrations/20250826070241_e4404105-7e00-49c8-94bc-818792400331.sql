-- Permitir cadastro de funcionários sem autenticação Supabase
CREATE POLICY IF NOT EXISTS "Anyone can insert employees"
ON employees
FOR INSERT
WITH CHECK (true);
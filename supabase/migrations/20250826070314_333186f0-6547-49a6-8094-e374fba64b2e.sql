-- Corrigir política para permitir inserção de funcionários
DROP POLICY IF EXISTS "Authenticated users can manage employees" ON employees;

CREATE POLICY "Anyone can insert employees"
ON employees
FOR INSERT
WITH CHECK (true);

-- Garantir que outras operações também funcionem
CREATE POLICY "Anyone can update employees"
ON employees
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete employees"
ON employees
FOR DELETE
USING (true);
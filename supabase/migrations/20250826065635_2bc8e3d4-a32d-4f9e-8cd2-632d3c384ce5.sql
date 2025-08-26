-- Corrigir políticas RLS para permitir cadastro de funcionários
-- Remover política que exige autenticação Supabase
DROP POLICY IF EXISTS "Authenticated users can manage branches" ON branches;

-- Criar nova política mais permissiva para inserção de filiais
CREATE POLICY "Anyone can create branches" 
ON branches 
FOR INSERT 
WITH CHECK (true);

-- Criar política para atualização de filiais
CREATE POLICY "Anyone can update branches" 
ON branches 
FOR UPDATE 
USING (true);

-- Criar política para deletar filiais
CREATE POLICY "Anyone can delete branches" 
ON branches 
FOR DELETE 
USING (true);

-- Verificar se a política de SELECT já existe e está funcionando
-- (A política "Anyone can view branches" já existe e está correta)
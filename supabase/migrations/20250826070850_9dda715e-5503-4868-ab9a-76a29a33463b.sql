-- Adicionar campos para associar chaves de acesso às empresas/filiais
ALTER TABLE access_keys 
ADD COLUMN company_id UUID REFERENCES companies(id),
ADD COLUMN branch_id UUID REFERENCES branches(id),
ADD COLUMN description TEXT;

-- Atualizar chaves existentes para associá-las à empresa/filial
UPDATE access_keys 
SET company_id = (SELECT id FROM companies LIMIT 1),
    description = 'Chave de acesso gerada automaticamente'
WHERE company_id IS NULL;
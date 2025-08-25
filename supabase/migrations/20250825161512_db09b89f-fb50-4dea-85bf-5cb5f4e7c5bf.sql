-- Adicionar campos adicionais à tabela companies para suportar todas as informações do cadastro
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS fantasy_name TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS state_registration TEXT,
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS number TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT;
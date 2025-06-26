
-- Criar tabela de empresas
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de usuários com dados completos
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  rg TEXT NOT NULL,
  birth_date DATE NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  contact TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'supervisor', 'user')),
  face_data TEXT, -- Dados da biometria facial em formato base64
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela master (separada para maior segurança)
CREATE TABLE public.master_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir usuário master padrão
INSERT INTO public.master_users (username, password, name) 
VALUES ('Master1', 'Master1', 'Master User');

-- Inserir algumas empresas de exemplo
INSERT INTO public.companies (name) VALUES 
('RaioX'),
('Empresa Alpha'),
('Empresa Beta'),
('TechCorp'),
('MediCenter');

-- Criar índices para melhor performance
CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_users_cpf ON public.users(cpf);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_master_users_username ON public.master_users(username);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permissivas para começar)
CREATE POLICY "Allow all operations on companies" ON public.companies FOR ALL USING (true);
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations on master_users" ON public.master_users FOR ALL USING (true);

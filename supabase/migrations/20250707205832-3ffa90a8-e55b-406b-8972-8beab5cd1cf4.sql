-- Criar tabela de filiais se não existir
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  contact TEXT NOT NULL,
  manager_username TEXT,
  manager_password TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de funcionários (sem login/senha)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
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
  position TEXT NOT NULL, -- gerente, supervisor, vendedor, outros
  custom_position TEXT, -- para posições personalizadas
  face_encoding TEXT, -- dados da biometria facial
  reference_photo_url TEXT, -- URL da foto de referência
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL
);

-- Criar tabela de registros de ponto para funcionários
CREATE TABLE IF NOT EXISTS public.employee_punch_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('entry', 'exit')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  face_confidence DECIMAL(3,2),
  photo_url TEXT,
  location JSONB,
  device_info JSONB,
  confirmed_by_employee BOOLEAN DEFAULT false,
  receipt_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_punch_records ENABLE ROW LEVEL SECURITY;

-- Políticas para branches
CREATE POLICY "Allow all operations on branches" 
ON public.branches FOR ALL 
USING (true);

-- Políticas para employees
CREATE POLICY "Allow all operations on employees" 
ON public.employees FOR ALL 
USING (true);

-- Políticas para employee_punch_records
CREATE POLICY "Allow all operations on employee punch records" 
ON public.employee_punch_records FOR ALL 
USING (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_branches_company_id ON public.branches(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON public.employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_cpf ON public.employees(cpf);
CREATE INDEX IF NOT EXISTS idx_employee_punch_records_employee_id ON public.employee_punch_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_punch_records_timestamp ON public.employee_punch_records(timestamp);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_branches_updated_at
BEFORE UPDATE ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
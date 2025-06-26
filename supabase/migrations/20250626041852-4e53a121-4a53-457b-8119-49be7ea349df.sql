
-- Criar tabela para configurações de limites por empresa
CREATE TABLE public.company_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  max_admins INTEGER DEFAULT 1,
  max_managers INTEGER DEFAULT 5,
  max_supervisors INTEGER DEFAULT 10,
  max_users INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.company_limits ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (será refinada posteriormente)
CREATE POLICY "Allow all operations on company_limits" ON public.company_limits FOR ALL USING (true);

-- Função para verificar limites antes de inserir usuários
CREATE OR REPLACE FUNCTION public.check_user_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
  role_column TEXT;
BEGIN
  -- Determinar qual coluna de limite verificar baseado no role
  CASE NEW.role
    WHEN 'admin' THEN role_column := 'max_admins';
    WHEN 'manager' THEN role_column := 'max_managers';
    WHEN 'supervisor' THEN role_column := 'max_supervisors';
    WHEN 'user' THEN role_column := 'max_users';
    ELSE RETURN NEW; -- Permite outros roles
  END CASE;

  -- Buscar o limite configurado para a empresa
  EXECUTE format('SELECT %I FROM public.company_limits WHERE company_id = $1', role_column)
  INTO max_allowed
  USING NEW.company_id;

  -- Se não há limite configurado, usar padrões
  IF max_allowed IS NULL THEN
    CASE NEW.role
      WHEN 'admin' THEN max_allowed := 1;
      WHEN 'manager' THEN max_allowed := 5;
      WHEN 'supervisor' THEN max_allowed := 10;
      WHEN 'user' THEN max_allowed := 50;
    END CASE;
  END IF;

  -- Contar usuários atuais do mesmo role na empresa
  SELECT COUNT(*)::INTEGER INTO current_count
  FROM public.users 
  WHERE company_id = NEW.company_id AND role = NEW.role;

  -- Verificar se excede o limite
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Limite de % usuários atingido para esta empresa (máximo: %)', NEW.role, max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para verificar limites antes de inserir
CREATE TRIGGER check_user_limit_trigger
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_limit();

-- Inserir limites padrão para empresas existentes
INSERT INTO public.company_limits (company_id, max_admins, max_managers, max_supervisors, max_users)
SELECT id, 1, 5, 10, 50 FROM public.companies
ON CONFLICT (company_id) DO NOTHING;

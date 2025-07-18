-- Corrigir vulnerabilidades de segurança das funções
-- Função para atualizar timestamps com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;

-- Função para log de ações do sistema com search_path seguro
CREATE OR REPLACE FUNCTION public.log_system_action(
    p_action text, 
    p_entity_type text, 
    p_user_id uuid DEFAULT NULL::uuid, 
    p_master_user_id uuid DEFAULT NULL::uuid, 
    p_entity_id uuid DEFAULT NULL::uuid, 
    p_details jsonb DEFAULT NULL::jsonb, 
    p_ip_address inet DEFAULT NULL::inet, 
    p_user_agent text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.system_logs (
    user_id, master_user_id, action, entity_type, entity_id, 
    details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_master_user_id, p_action, p_entity_type, p_entity_id,
    p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- Função para verificar limite de usuários com search_path seguro
CREATE OR REPLACE FUNCTION public.check_user_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Criar view unificada para registros de ponto
CREATE OR REPLACE VIEW public.unified_punch_records AS
SELECT 
    pr.id,
    pr.user_id as employee_id,
    'user' as record_source,
    pr.punch_type,
    pr.timestamp,
    pr.confidence_score as face_confidence,
    pr.face_image_url as photo_url,
    pr.device_info,
    pr.location,
    NULL::uuid as branch_id,
    NULL::boolean as confirmed_by_employee,
    NULL::boolean as receipt_sent,
    pr.created_at,
    u.name as employee_name,
    u.company_id,
    u.role as employee_role,
    NULL as employee_position,
    c.name as company_name,
    NULL as branch_name
FROM punch_records pr
JOIN users u ON pr.user_id = u.id
JOIN companies c ON u.company_id = c.id

UNION ALL

SELECT 
    epr.id,
    epr.employee_id,
    'employee' as record_source,
    epr.punch_type,
    epr.timestamp,
    epr.face_confidence,
    epr.photo_url,
    epr.device_info,
    epr.location,
    epr.branch_id,
    epr.confirmed_by_employee,
    epr.receipt_sent,
    epr.created_at,
    e.name as employee_name,
    b.company_id,
    'employee' as employee_role,
    e.position as employee_position,
    c.name as company_name,
    b.name as branch_name
FROM employee_punch_records epr
JOIN employees e ON epr.employee_id = e.id
JOIN branches b ON epr.branch_id = b.id
JOIN companies c ON b.company_id = c.id;

-- Criar índices para performance (corrigidos)
CREATE INDEX IF NOT EXISTS idx_punch_records_timestamp 
ON punch_records USING btree (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_employee_punch_records_timestamp 
ON employee_punch_records USING btree (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_employees_branch_active 
ON employees USING btree (branch_id, is_active);

CREATE INDEX IF NOT EXISTS idx_users_company_role 
ON users USING btree (company_id, role);

-- Criar tabela para cache de relatórios
CREATE TABLE IF NOT EXISTS public.report_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    filters JSONB,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de cache
ALTER TABLE public.report_cache ENABLE ROW LEVEL SECURITY;

-- Política para cache de relatórios
CREATE POLICY "Allow cache access by company" 
ON public.report_cache 
FOR ALL 
USING (true);

-- Trigger para atualizar timestamp da tabela de cache
CREATE TRIGGER update_report_cache_updated_at
    BEFORE UPDATE ON public.report_cache
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para limpeza automática do cache
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    DELETE FROM public.report_cache 
    WHERE expires_at < NOW();
END;
$function$;
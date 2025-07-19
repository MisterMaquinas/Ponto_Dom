-- Atualizar planos de assinatura com os valores especificados
DELETE FROM public.subscription_plans;

INSERT INTO public.subscription_plans (name, description, price_monthly, max_users, max_branches, features, is_active) VALUES
('Plano Básico', 'Ideal para pequenas empresas com uma filial', 99.00, 10, 1, '["Gestão de funcionários", "Relatórios básicos", "Suporte por email"]', true),
('Plano Profissional', 'Perfeito para empresas em crescimento', 199.00, 50, 5, '["Gestão de funcionários", "Múltiplas filiais", "Relatórios avançados", "Suporte prioritário"]', true),
('Plano Empresarial', 'Para grandes empresas com múltiplas filiais', 499.00, 200, 20, '["Gestão completa", "Múltiplas filiais", "Relatórios personalizados", "API acesso", "Suporte 24/7"]', true),
('Plano Personalizado', 'Plano customizável conforme necessidade', 0.00, 9999, 9999, '["Limites personalizáveis", "Recursos sob demanda", "Suporte dedicado"]', true);

-- Função para sincronizar limites da empresa com o plano
CREATE OR REPLACE FUNCTION public.sync_company_limits_with_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar ou inserir limites da empresa baseado no plano
  INSERT INTO public.company_limits (
    company_id, 
    max_users, 
    max_admins, 
    max_managers, 
    max_supervisors
  ) VALUES (
    NEW.company_id,
    COALESCE((SELECT max_users FROM public.subscription_plans WHERE id = NEW.plan_id), 50),
    1, -- sempre 1 admin
    GREATEST(1, COALESCE((SELECT max_users FROM public.subscription_plans WHERE id = NEW.plan_id), 50) / 10), -- 10% dos usuários podem ser managers
    GREATEST(1, COALESCE((SELECT max_users FROM public.subscription_plans WHERE id = NEW.plan_id), 50) / 5) -- 20% dos usuários podem ser supervisors
  )
  ON CONFLICT (company_id) 
  DO UPDATE SET
    max_users = COALESCE((SELECT max_users FROM public.subscription_plans WHERE id = NEW.plan_id), 50),
    max_managers = GREATEST(1, COALESCE((SELECT max_users FROM public.subscription_plans WHERE id = NEW.plan_id), 50) / 10),
    max_supervisors = GREATEST(1, COALESCE((SELECT max_users FROM public.subscription_plans WHERE id = NEW.plan_id), 50) / 5),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar automaticamente quando assinatura for criada/atualizada
DROP TRIGGER IF EXISTS sync_company_limits_trigger ON public.company_subscriptions;
CREATE TRIGGER sync_company_limits_trigger
  AFTER INSERT OR UPDATE OF plan_id ON public.company_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_company_limits_with_plan();

-- Adicionar campos personalizáveis para planos personalizados
ALTER TABLE public.company_subscriptions 
ADD COLUMN IF NOT EXISTS custom_max_users INTEGER,
ADD COLUMN IF NOT EXISTS custom_max_branches INTEGER,
ADD COLUMN IF NOT EXISTS custom_price NUMERIC;

-- Função melhorada para verificar se assinatura está ativa
CREATE OR REPLACE FUNCTION public.is_company_subscription_active(company_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  subscription_record RECORD;
BEGIN
  SELECT * INTO subscription_record
  FROM public.company_subscriptions
  WHERE company_id = company_uuid;
  
  -- Se não tem assinatura, considera inativa
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica status e data de expiração
  IF subscription_record.status = 'active' AND subscription_record.expires_at > NOW() THEN
    RETURN TRUE;
  END IF;
  
  -- Verifica período de graça
  IF subscription_record.status = 'active' AND 
     subscription_record.expires_at + INTERVAL '1 day' * subscription_record.grace_period_days > NOW() THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

-- Sincronizar limites existentes
UPDATE public.company_limits 
SET max_users = COALESCE(
  (SELECT 
    CASE 
      WHEN cs.custom_max_users IS NOT NULL THEN cs.custom_max_users
      ELSE sp.max_users 
    END
   FROM public.company_subscriptions cs
   JOIN public.subscription_plans sp ON cs.plan_id = sp.id
   WHERE cs.company_id = company_limits.company_id
  ), 50),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.company_subscriptions 
  WHERE company_id = company_limits.company_id
);
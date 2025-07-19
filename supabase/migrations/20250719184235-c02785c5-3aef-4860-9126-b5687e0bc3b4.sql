-- Atualizar ou inserir planos específicos
INSERT INTO public.subscription_plans (name, description, price_monthly, max_users, max_branches, features, is_active) VALUES
('Plano Básico', 'Ideal para pequenas empresas com uma filial', 99.00, 10, 1, '["Gestão de funcionários", "Relatórios básicos", "Suporte por email"]', true),
('Plano Profissional', 'Perfeito para empresas em crescimento', 199.00, 50, 5, '["Gestão de funcionários", "Múltiplas filiais", "Relatórios avançados", "Suporte prioritário"]', true),
('Plano Empresarial', 'Para grandes empresas com múltiplas filiais', 499.00, 200, 20, '["Gestão completa", "Múltiplas filiais", "Relatórios personalizados", "API acesso", "Suporte 24/7"]', true),
('Plano Personalizado', 'Plano customizável conforme necessidade', 0.00, 9999, 9999, '["Limites personalizáveis", "Recursos sob demanda", "Suporte dedicado"]', true);

-- Adicionar campos personalizáveis para planos personalizados
ALTER TABLE public.company_subscriptions 
ADD COLUMN IF NOT EXISTS custom_max_users INTEGER,
ADD COLUMN IF NOT EXISTS custom_max_branches INTEGER,
ADD COLUMN IF NOT EXISTS custom_price NUMERIC;

-- Função para sincronizar limites da empresa com o plano
CREATE OR REPLACE FUNCTION public.sync_company_limits_with_plan()
RETURNS TRIGGER AS $$
DECLARE
  plan_max_users INTEGER;
BEGIN
  -- Buscar limite de usuários do plano (ou usar valor customizado)
  SELECT 
    CASE 
      WHEN NEW.custom_max_users IS NOT NULL THEN NEW.custom_max_users
      ELSE sp.max_users 
    END INTO plan_max_users
  FROM public.subscription_plans sp 
  WHERE sp.id = NEW.plan_id;

  -- Se não encontrou o plano, usar padrão
  IF plan_max_users IS NULL THEN
    plan_max_users := 50;
  END IF;

  -- Inserir ou atualizar limites da empresa
  INSERT INTO public.company_limits (
    company_id, 
    max_users, 
    max_admins, 
    max_managers, 
    max_supervisors
  ) VALUES (
    NEW.company_id,
    plan_max_users,
    1, -- sempre 1 admin
    GREATEST(1, plan_max_users / 10), -- 10% dos usuários podem ser managers
    GREATEST(1, plan_max_users / 5) -- 20% dos usuários podem ser supervisors
  )
  ON CONFLICT (company_id) 
  DO UPDATE SET
    max_users = plan_max_users,
    max_managers = GREATEST(1, plan_max_users / 10),
    max_supervisors = GREATEST(1, plan_max_users / 5),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar automaticamente
DROP TRIGGER IF EXISTS sync_company_limits_trigger ON public.company_subscriptions;
CREATE TRIGGER sync_company_limits_trigger
  AFTER INSERT OR UPDATE OF plan_id, custom_max_users ON public.company_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_company_limits_with_plan();
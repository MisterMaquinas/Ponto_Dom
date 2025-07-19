-- Sistema de controle de pagamentos e bloqueio para empresas
-- Criar tabela de planos disponíveis
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  max_users INTEGER DEFAULT 50,
  max_branches INTEGER DEFAULT 5,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de assinaturas das empresas
CREATE TABLE public.company_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_due TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_amount DECIMAL(10,2),
  grace_period_days INTEGER DEFAULT 7,
  auto_suspend BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Criar tabela de histórico de pagamentos
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.company_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_method TEXT DEFAULT 'manual',
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.master_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permitir acesso total ao master
CREATE POLICY "Allow all operations on subscription_plans" 
ON public.subscription_plans FOR ALL USING (true);

CREATE POLICY "Allow all operations on company_subscriptions" 
ON public.company_subscriptions FOR ALL USING (true);

CREATE POLICY "Allow all operations on payment_history" 
ON public.payment_history FOR ALL USING (true);

-- Inserir planos padrão
INSERT INTO public.subscription_plans (name, description, price_monthly, max_users, max_branches, features) VALUES
('Básico', 'Plano básico para pequenas empresas', 99.90, 25, 2, '["Controle de ponto", "Relatórios básicos", "Suporte por email"]'::jsonb),
('Profissional', 'Plano profissional para empresas médias', 199.90, 100, 10, '["Controle de ponto", "Relatórios avançados", "Múltiplas filiais", "Suporte prioritário"]'::jsonb),
('Empresarial', 'Plano empresarial para grandes empresas', 399.90, 500, 50, '["Controle de ponto", "Relatórios completos", "Filiais ilimitadas", "API personalizada", "Suporte 24/7"]'::jsonb);

-- Função para verificar se empresa está ativa
CREATE OR REPLACE FUNCTION public.is_company_subscription_active(company_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Função para suspender empresas automaticamente
CREATE OR REPLACE FUNCTION public.auto_suspend_expired_companies()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  suspended_count INTEGER := 0;
BEGIN
  -- Suspender empresas que passaram do período de graça
  UPDATE public.company_subscriptions
  SET status = 'suspended',
      updated_at = NOW()
  WHERE status = 'active'
    AND expires_at + INTERVAL '1 day' * grace_period_days < NOW()
    AND auto_suspend = true;
  
  GET DIAGNOSTICS suspended_count = ROW_COUNT;
  
  -- Log da ação
  INSERT INTO public.system_logs (action, entity_type, details)
  VALUES ('auto_suspend', 'company_subscriptions', 
          jsonb_build_object('suspended_count', suspended_count, 'timestamp', NOW()));
  
  RETURN suspended_count;
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_subscriptions_updated_at
  BEFORE UPDATE ON public.company_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
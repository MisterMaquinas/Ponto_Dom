
-- Criar tabela para filiais das empresas
CREATE TABLE public.company_branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  contact TEXT NOT NULL,
  manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações do sistema
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de ações do sistema
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  master_user_id UUID REFERENCES public.master_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para relatórios customizados
CREATE TABLE public.custom_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  filters JSONB,
  columns JSONB,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  is_scheduled BOOLEAN DEFAULT false,
  schedule_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_company_branches_company_id ON public.company_branches(company_id);
CREATE INDEX idx_company_branches_manager_id ON public.company_branches(manager_id);
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX idx_system_logs_master_user_id ON public.system_logs(master_user_id);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);
CREATE INDEX idx_custom_reports_company_id ON public.custom_reports(company_id);
CREATE INDEX idx_custom_reports_created_by ON public.custom_reports(created_by);

-- Habilitar RLS
ALTER TABLE public.company_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para company_branches
CREATE POLICY "Allow all operations on company_branches" ON public.company_branches FOR ALL USING (true);

-- Políticas RLS para system_settings
CREATE POLICY "Allow all operations on system_settings" ON public.system_settings FOR ALL USING (true);

-- Políticas RLS para system_logs
CREATE POLICY "Allow all operations on system_logs" ON public.system_logs FOR ALL USING (true);

-- Políticas RLS para custom_reports
CREATE POLICY "Allow all operations on custom_reports" ON public.custom_reports FOR ALL USING (true);

-- Inserir configurações padrão do sistema
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('max_login_attempts', '5', 'Número máximo de tentativas de login'),
('session_timeout', '3600', 'Tempo limite da sessão em segundos'),
('backup_frequency', '24', 'Frequência de backup em horas'),
('maintenance_mode', 'false', 'Modo de manutenção do sistema'),
('default_company_limits', '{"max_admins": 1, "max_managers": 5, "max_supervisors": 10, "max_users": 50}', 'Limites padrão para novas empresas');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_company_branches_updated_at BEFORE UPDATE ON public.company_branches FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_custom_reports_updated_at BEFORE UPDATE ON public.custom_reports FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Função para registrar logs do sistema (corrigida)
CREATE OR REPLACE FUNCTION public.log_system_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_master_user_id UUID DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;

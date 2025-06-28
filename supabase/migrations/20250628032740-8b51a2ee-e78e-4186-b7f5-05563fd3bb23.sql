
-- Criar bucket para armazenar imagens de biometria
INSERT INTO storage.buckets (id, name, public) 
VALUES ('biometric-images', 'biometric-images', false);

-- Políticas para o bucket de biometria
CREATE POLICY "Allow authenticated users to upload biometric images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'biometric-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view biometric images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'biometric-images' AND auth.role() = 'authenticated');

-- Tabela para armazenar fotos de referência dos usuários
CREATE TABLE public.user_biometric_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reference_photo_url TEXT NOT NULL,
  face_encoding TEXT, -- Para armazenar dados de reconhecimento facial
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_user_biometric_photos_user_id ON public.user_biometric_photos(user_id);
CREATE INDEX idx_user_biometric_photos_active ON public.user_biometric_photos(is_active);

-- Tabela para logs de tentativas de reconhecimento
CREATE TABLE public.biometric_verification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  attempt_photo_url TEXT NOT NULL,
  reference_photo_url TEXT NOT NULL,
  similarity_score DECIMAL(5,4), -- Score de similaridade (0.0000 a 1.0000)
  verification_result TEXT NOT NULL CHECK (verification_result IN ('success', 'failed', 'error')),
  error_message TEXT,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para logs de verificação
CREATE INDEX idx_biometric_verification_logs_user_id ON public.biometric_verification_logs(user_id);
CREATE INDEX idx_biometric_verification_logs_result ON public.biometric_verification_logs(verification_result);
CREATE INDEX idx_biometric_verification_logs_created_at ON public.biometric_verification_logs(created_at);

-- RLS para user_biometric_photos
ALTER TABLE public.user_biometric_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow view biometric photos" 
ON public.user_biometric_photos FOR SELECT 
USING (true);

CREATE POLICY "Allow insert biometric photos" 
ON public.user_biometric_photos FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update biometric photos" 
ON public.user_biometric_photos FOR UPDATE 
USING (true);

-- RLS para biometric_verification_logs
ALTER TABLE public.biometric_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow view verification logs" 
ON public.biometric_verification_logs FOR SELECT 
USING (true);

CREATE POLICY "Allow insert verification logs" 
ON public.biometric_verification_logs FOR INSERT 
WITH CHECK (true);

-- Atualizar punch_records para incluir verification_log_id
ALTER TABLE public.punch_records 
ADD COLUMN verification_log_id UUID REFERENCES public.biometric_verification_logs(id) ON DELETE SET NULL;

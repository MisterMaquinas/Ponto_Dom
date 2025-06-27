
-- Tabela para armazenar registros de ponto
CREATE TABLE public.punch_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('entry', 'exit')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location JSONB,
  device_info JSONB,
  confidence_score DECIMAL(3,2),
  face_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para histórico de reconhecimento facial
CREATE TABLE public.face_recognition_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recognition_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confidence_score DECIMAL(3,2) NOT NULL,
  face_image_url TEXT NOT NULL,
  recognition_status TEXT NOT NULL CHECK (recognition_status IN ('success', 'failed', 'low_confidence')),
  device_info JSONB,
  location JSONB,
  punch_record_id UUID REFERENCES public.punch_records(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_punch_records_user_id ON public.punch_records(user_id);
CREATE INDEX idx_punch_records_timestamp ON public.punch_records(timestamp);
CREATE INDEX idx_face_recognition_logs_user_id ON public.face_recognition_logs(user_id);
CREATE INDEX idx_face_recognition_logs_timestamp ON public.face_recognition_logs(recognition_timestamp);

-- Bucket para armazenar imagens de reconhecimento facial
INSERT INTO storage.buckets (id, name, public) 
VALUES ('face-recognition', 'face-recognition', false);

-- Políticas para o bucket de reconhecimento facial
CREATE POLICY "Allow authenticated users to upload face images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'face-recognition' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view face images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'face-recognition' AND auth.role() = 'authenticated');

-- RLS para punch_records
ALTER TABLE public.punch_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own punch records" 
ON public.punch_records FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE username = current_user));

CREATE POLICY "Allow insert punch records" 
ON public.punch_records FOR INSERT 
WITH CHECK (true);

-- RLS para face_recognition_logs
ALTER TABLE public.face_recognition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow view face recognition logs" 
ON public.face_recognition_logs FOR SELECT 
USING (true);

CREATE POLICY "Allow insert face recognition logs" 
ON public.face_recognition_logs FOR INSERT 
WITH CHECK (true);

-- Create face recognition logs table
CREATE TABLE IF NOT EXISTS public.face_recognition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recognition_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  confidence_score NUMERIC NOT NULL,
  face_image_url TEXT NOT NULL,
  recognition_status TEXT NOT NULL CHECK (recognition_status IN ('success','failed','low_confidence')),
  device_info JSONB,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable RLS and policies
ALTER TABLE public.face_recognition_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view face recognition logs" ON public.face_recognition_logs;
CREATE POLICY "Anyone can view face recognition logs"
ON public.face_recognition_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert face recognition logs" ON public.face_recognition_logs;
CREATE POLICY "Anyone can insert face recognition logs"
ON public.face_recognition_logs FOR INSERT WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_face_recognition_logs_updated_at ON public.face_recognition_logs;
CREATE TRIGGER update_face_recognition_logs_updated_at
BEFORE UPDATE ON public.face_recognition_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create user biometric photos table
CREATE TABLE IF NOT EXISTS public.user_biometric_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_bio_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

ALTER TABLE public.user_biometric_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view biometric photos" ON public.user_biometric_photos;
CREATE POLICY "Anyone can view biometric photos"
ON public.user_biometric_photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert biometric photos" ON public.user_biometric_photos;
CREATE POLICY "Anyone can insert biometric photos"
ON public.user_biometric_photos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update biometric photos" ON public.user_biometric_photos;
CREATE POLICY "Anyone can update biometric photos"
ON public.user_biometric_photos FOR UPDATE USING (true);

DROP TRIGGER IF EXISTS update_user_biometric_photos_updated_at ON public.user_biometric_photos;
CREATE TRIGGER update_user_biometric_photos_updated_at
BEFORE UPDATE ON public.user_biometric_photos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create punch records table
CREATE TABLE IF NOT EXISTS public.punch_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('entrada','saida','intervalo_inicio','intervalo_fim')),
  confidence_score NUMERIC,
  verification_log_id UUID REFERENCES public.face_recognition_logs(id) ON DELETE SET NULL,
  device_info JSONB,
  location TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_punch_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

ALTER TABLE public.punch_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view punch records" ON public.punch_records;
CREATE POLICY "Anyone can view punch records"
ON public.punch_records FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert punch records" ON public.punch_records;
CREATE POLICY "Anyone can insert punch records"
ON public.punch_records FOR INSERT WITH CHECK (true);

DROP TRIGGER IF EXISTS update_punch_records_updated_at ON public.punch_records;
CREATE TRIGGER update_punch_records_updated_at
BEFORE UPDATE ON public.punch_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_face_logs_user_time ON public.face_recognition_logs(user_id, recognition_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_punch_user_time ON public.punch_records(user_id, timestamp DESC);

-- Create public storage bucket for face images
INSERT INTO storage.buckets (id, name, public)
VALUES ('face-recognition','face-recognition', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
DROP POLICY IF EXISTS "Face images are publicly accessible" ON storage.objects;
CREATE POLICY "Face images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'face-recognition');

DROP POLICY IF EXISTS "Anyone can upload face images" ON storage.objects;
CREATE POLICY "Anyone can upload face images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'face-recognition');

DROP POLICY IF EXISTS "Anyone can update face images" ON storage.objects;
CREATE POLICY "Anyone can update face images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'face-recognition');

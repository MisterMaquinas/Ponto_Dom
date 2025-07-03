-- Melhorar a estrutura das tabelas de biometria
-- Criar storage bucket para fotos biométricas se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('biometric-photos', 'biometric-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket de fotos biométricas
CREATE POLICY "Permitir inserção de fotos biométricas" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'biometric-photos');

CREATE POLICY "Permitir visualização de fotos biométricas" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'biometric-photos');

CREATE POLICY "Permitir atualização de fotos biométricas" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'biometric-photos');

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_biometric_photos_user_active 
ON user_biometric_photos(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_biometric_verification_logs_user_created 
ON biometric_verification_logs(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_face_recognition_logs_user_timestamp 
ON face_recognition_logs(user_id, recognition_timestamp);
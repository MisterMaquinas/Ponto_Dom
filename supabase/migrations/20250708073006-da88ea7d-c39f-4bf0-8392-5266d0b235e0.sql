-- Criar bucket para fotos biométricas se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('biometric-photos', 'biometric-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas para upload e acesso de fotos biométricas
CREATE POLICY "Allow authenticated users to upload biometric photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'biometric-photos');

CREATE POLICY "Allow authenticated users to view biometric photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'biometric-photos');

CREATE POLICY "Allow authenticated users to update biometric photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'biometric-photos');

CREATE POLICY "Allow authenticated users to delete biometric photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'biometric-photos');
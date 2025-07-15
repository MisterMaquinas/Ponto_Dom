-- Inserir credenciais padrão do Master
INSERT INTO public.master_users (username, password, name) 
VALUES ('Master', 'Master123#', 'Administrador Master')
ON CONFLICT (username) 
DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name;
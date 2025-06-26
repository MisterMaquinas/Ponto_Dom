
-- Remover todos os usuários (incluindo administradores) de todas as empresas
DELETE FROM public.users;

-- Remover todas as empresas (incluindo RaioX e outras de exemplo)
DELETE FROM public.companies;

-- Resetar as sequências se necessário (opcional, para começar IDs do zero novamente)
-- Isso não é necessário já que usamos UUID, mas garante limpeza total

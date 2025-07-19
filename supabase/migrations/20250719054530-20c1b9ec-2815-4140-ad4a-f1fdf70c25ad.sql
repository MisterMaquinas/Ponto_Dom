-- Corrigir a view unified_punch_records removendo SECURITY DEFINER
-- e adicionando políticas RLS adequadas

-- Remover a view existente
DROP VIEW IF EXISTS public.unified_punch_records;

-- Recriar a view sem SECURITY DEFINER
CREATE VIEW public.unified_punch_records AS
SELECT 
    pr.id,
    pr.user_id AS employee_id,
    'user'::text AS record_source,
    pr.punch_type,
    pr.timestamp,
    pr.confidence_score AS face_confidence,
    pr.face_image_url AS photo_url,
    pr.device_info,
    pr.location,
    NULL::uuid AS branch_id,
    NULL::boolean AS confirmed_by_employee,
    NULL::boolean AS receipt_sent,
    pr.created_at,
    u.name AS employee_name,
    u.company_id,
    u.role AS employee_role,
    NULL::text AS employee_position,
    c.name AS company_name,
    NULL::text AS branch_name
FROM punch_records pr
JOIN users u ON pr.user_id = u.id
JOIN companies c ON u.company_id = c.id

UNION ALL

SELECT 
    epr.id,
    epr.employee_id,
    'employee'::text AS record_source,
    epr.punch_type,
    epr.timestamp,
    epr.face_confidence,
    epr.photo_url,
    epr.device_info,
    epr.location,
    epr.branch_id,
    epr.confirmed_by_employee,
    epr.receipt_sent,
    epr.created_at,
    e.name AS employee_name,
    b.company_id,
    'employee'::text AS employee_role,
    e.position AS employee_position,
    c.name AS company_name,
    b.name AS branch_name
FROM employee_punch_records epr
JOIN employees e ON epr.employee_id = e.id
JOIN branches b ON epr.branch_id = b.id
JOIN companies c ON b.company_id = c.id;

-- Habilitar RLS na view
ALTER VIEW public.unified_punch_records SET (security_invoker = true);

-- Comentário da view
COMMENT ON VIEW public.unified_punch_records IS 'Unified view of punch records from both users and employees tables without SECURITY DEFINER';
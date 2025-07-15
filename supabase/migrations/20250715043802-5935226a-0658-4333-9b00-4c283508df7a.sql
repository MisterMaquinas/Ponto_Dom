-- Atualizar tipos de punch para incluir entrada, saída e intervalo
ALTER TABLE employee_punch_records DROP CONSTRAINT IF EXISTS employee_punch_records_punch_type_check;
ALTER TABLE punch_records DROP CONSTRAINT IF EXISTS punch_records_punch_type_check;

-- Adicionar novos tipos de punch mais intuitivos
ALTER TABLE employee_punch_records ADD CONSTRAINT employee_punch_records_punch_type_check 
CHECK (punch_type IN ('entrada', 'saida', 'intervalo_inicio', 'intervalo_fim', 'clock_in', 'clock_out', 'break_start', 'break_end', 'punch', 'entry', 'exit'));

ALTER TABLE punch_records ADD CONSTRAINT punch_records_punch_type_check 
CHECK (punch_type IN ('entrada', 'saida', 'intervalo_inicio', 'intervalo_fim', 'clock_in', 'clock_out', 'break_start', 'break_end', 'punch', 'entry', 'exit'));
-- Adicionar campos de horário de trabalho para funcionários
ALTER TABLE employees 
ADD COLUMN work_start_time TIME DEFAULT NULL,
ADD COLUMN work_end_time TIME DEFAULT NULL,
ADD COLUMN break_start_time TIME DEFAULT NULL,
ADD COLUMN break_end_time TIME DEFAULT NULL;

-- Comentário para explicar os campos
COMMENT ON COLUMN employees.work_start_time IS 'Horário de entrada do funcionário (opcional)';
COMMENT ON COLUMN employees.work_end_time IS 'Horário de saída do funcionário (opcional)';
COMMENT ON COLUMN employees.break_start_time IS 'Horário de início do intervalo (opcional)';
COMMENT ON COLUMN employees.break_end_time IS 'Horário de fim do intervalo (opcional)';
-- Drop the existing constraint that doesn't allow 'punch' value
ALTER TABLE employee_punch_records DROP CONSTRAINT IF EXISTS employee_punch_records_punch_type_check;

-- Add new constraint that includes 'punch' as valid value
ALTER TABLE employee_punch_records ADD CONSTRAINT employee_punch_records_punch_type_check 
CHECK (punch_type IN ('clock_in', 'clock_out', 'break_start', 'break_end', 'punch'));
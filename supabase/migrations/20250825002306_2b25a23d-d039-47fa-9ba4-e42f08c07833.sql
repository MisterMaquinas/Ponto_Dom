-- Create employee_punch_records table for branch employee time tracking
CREATE TABLE IF NOT EXISTS public.employee_punch_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  punch_type text NOT NULL CHECK (punch_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
  face_confidence numeric,
  photo_url text,
  confirmed_by_employee boolean DEFAULT false,
  device_info jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on employee_punch_records
ALTER TABLE public.employee_punch_records ENABLE ROW LEVEL SECURITY;

-- Create policies for employee_punch_records
CREATE POLICY "Anyone can insert punch records" ON public.employee_punch_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view punch records" ON public.employee_punch_records FOR SELECT USING (true);
CREATE POLICY "Anyone can update punch records" ON public.employee_punch_records FOR UPDATE USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_employee_punch_records_updated_at
  BEFORE UPDATE ON public.employee_punch_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
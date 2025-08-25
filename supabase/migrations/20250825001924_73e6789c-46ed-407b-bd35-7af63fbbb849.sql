-- Add missing tables and columns for the face recognition system

-- Add name column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name text;

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  status text DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  address text,
  phone text,
  status text DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  cpf text,
  rg text,
  birth_date date,
  street text,
  number text,
  neighborhood text,  
  city text,
  state text,
  zip_code text,
  contact text,
  position text,
  reference_photo_url text,
  face_encoding text,
  status text DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create biometric_verification_logs table
CREATE TABLE IF NOT EXISTS public.biometric_verification_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  reference_photo_url text,
  verification_result boolean DEFAULT false,
  confidence_score numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_verification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage companies" ON public.companies FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for branches
CREATE POLICY "Anyone can view branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage branches" ON public.branches FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for employees
CREATE POLICY "Anyone can view employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage employees" ON public.employees FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for biometric verification logs
CREATE POLICY "Anyone can insert verification logs" ON public.biometric_verification_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view verification logs" ON public.biometric_verification_logs FOR SELECT USING (true);

-- Create storage bucket for biometric photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('biometric-photos', 'biometric-photos', true) 
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for biometric photos
CREATE POLICY "Anyone can view biometric photos" ON storage.objects FOR SELECT USING (bucket_id = 'biometric-photos');
CREATE POLICY "Anyone can upload biometric photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'biometric-photos');
CREATE POLICY "Anyone can update biometric photos" ON storage.objects FOR UPDATE USING (bucket_id = 'biometric-photos');

-- Create triggers for updated_at columns
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_biometric_verification_logs_updated_at
  BEFORE UPDATE ON public.biometric_verification_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
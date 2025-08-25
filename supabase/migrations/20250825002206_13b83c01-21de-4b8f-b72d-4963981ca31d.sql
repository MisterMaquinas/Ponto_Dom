-- Align database schema with application code expectations

-- Add branch manager credential fields and status
ALTER TABLE public.branches 
  ADD COLUMN IF NOT EXISTS manager_username text,
  ADD COLUMN IF NOT EXISTS manager_password text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add additional employee fields used by the app
ALTER TABLE public.employees 
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS custom_position text,
  ADD COLUMN IF NOT EXISTS work_start_time text,
  ADD COLUMN IF NOT EXISTS work_end_time text,
  ADD COLUMN IF NOT EXISTS break_start_time text,
  ADD COLUMN IF NOT EXISTS break_end_time text;

-- Link users to companies for filtering
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Ensure face_recognition_logs has a FK to users for joins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_face_recognition_logs_user' 
      AND table_name = 'face_recognition_logs'
  ) THEN
    ALTER TABLE public.face_recognition_logs
      ADD CONSTRAINT fk_face_recognition_logs_user
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;
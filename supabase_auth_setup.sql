-- ============================================================
-- Run this AFTER service_report_schema.sql
-- Links Supabase Auth users to technician profiles + adds RLS
-- ============================================================

-- Profile row created automatically for every authenticated user
CREATE TABLE profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT,
    role        TEXT NOT NULL DEFAULT 'technician', -- technician | admin
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------- Row Level Security ----------
ALTER TABLE service_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_replaced ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Any logged-in user (technician) can read/write reports.
-- Tighten this later (e.g. technician_id = auth.uid()) once you have
-- multiple technicians and want to restrict editing to your own drafts.
CREATE POLICY "Authenticated users can manage reports"
    ON service_reports FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage parts"
    ON parts_replaced FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- ============================================================
-- Excel Test Sdn. Bhd. — Service Report Digitization
-- PostgreSQL schema (works as-is on Supabase / RDS / Cloud SQL)
-- ============================================================

-- ---------- Extensions ----------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- Technicians (your internal users) ----------
CREATE TABLE technicians (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    phone         TEXT,
    role          TEXT NOT NULL DEFAULT 'technician', -- technician | admin
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Clients ----------
CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name    TEXT NOT NULL,
    contact_person  TEXT,
    contact_no      TEXT,
    email           TEXT,
    address         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Job number sequence ----------
-- This guarantees atomic, gap-free-ish, collision-proof numbering
-- even when multiple technicians submit reports at the exact same time.
-- Set START to continue from your current paper numbering (e.g. next after SR-01814).
CREATE SEQUENCE job_no_seq START WITH 1815;

-- Helper function: returns a formatted job number like 'SR-01815'
CREATE OR REPLACE FUNCTION generate_job_no() RETURNS TEXT AS $$
DECLARE
    next_val INT;
BEGIN
    next_val := nextval('job_no_seq');
    RETURN 'SR-' || LPAD(next_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ---------- Service reports (main table) ----------
CREATE TABLE service_reports (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_no                  TEXT NOT NULL UNIQUE DEFAULT generate_job_no(),
    ref_no                  TEXT,

    client_id               UUID REFERENCES clients(id),
    technician_id           UUID REFERENCES technicians(id),

    report_date             DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Equipment details
    equipment               TEXT,
    brand                   TEXT,
    model                   TEXT,
    sn_cr_no                TEXT,

    -- Customer-side contact on the report
    user_name               TEXT,
    contact_no              TEXT,

    -- Type of service (multi-select booleans; simplest & most query-friendly)
    site_calibration        BOOLEAN NOT NULL DEFAULT FALSE,
    adhoc                   BOOLEAN NOT NULL DEFAULT FALSE,
    mapping_validation      BOOLEAN NOT NULL DEFAULT FALSE,
    plan_preventive_maint   BOOLEAN NOT NULL DEFAULT FALSE,
    contract_service        BOOLEAN NOT NULL DEFAULT FALSE,
    training                BOOLEAN NOT NULL DEFAULT FALSE,
    warranty                BOOLEAN NOT NULL DEFAULT FALSE,
    others_text             TEXT,

    job_scope               TEXT,
    action_taken             TEXT,
    conclusion               TEXT,

    -- Signatures (store as URLs pointing to cloud storage, not raw blobs)
    customer_signature_url   TEXT,
    customer_name             TEXT,
    customer_signed_at        TIMESTAMPTZ,

    technician_signature_url  TEXT,
    technician_signed_at      TIMESTAMPTZ,

    -- Workflow status
    status                   TEXT NOT NULL DEFAULT 'draft',
        -- draft | pending_signature | completed | sent_to_client

    pdf_url                  TEXT,

    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_reports_client   ON service_reports(client_id);
CREATE INDEX idx_service_reports_tech     ON service_reports(technician_id);
CREATE INDEX idx_service_reports_status   ON service_reports(status);
CREATE INDEX idx_service_reports_job_no   ON service_reports(job_no);

-- ---------- Parts replaced (one-to-many) ----------
CREATE TABLE parts_replaced (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_report_id   UUID NOT NULL REFERENCES service_reports(id) ON DELETE CASCADE,
    description          TEXT NOT NULL,
    qty                   INT NOT NULL DEFAULT 1
);

CREATE INDEX idx_parts_replaced_report ON parts_replaced(service_report_id);

-- ---------- Auto-update updated_at on change ----------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_reports_updated_at
BEFORE UPDATE ON service_reports
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Notes
-- ============================================================
-- 1. job_no is generated automatically on INSERT via generate_job_no(),
--    so your application code never has to compute it manually — just
--    INSERT the row and read back the job_no that was assigned.
--
-- 2. The UNIQUE constraint on job_no is a safety net: even if the
--    sequence logic were ever bypassed, Postgres will reject a duplicate.
--
-- 3. If you'd rather reset numbering every year (e.g. SR-2026-0001),
--    replace job_no_seq with a `counters` table keyed by year and
--    increment it inside a transaction using SELECT ... FOR UPDATE
--    to keep it race-condition safe.
--
-- 4. If using Supabase, add Row Level Security (RLS) policies so
--    technicians can only SELECT/UPDATE their own draft reports,
--    while admins can see everything. Example:
--
--    ALTER TABLE service_reports ENABLE ROW LEVEL SECURITY;
--    CREATE POLICY "Technicians manage own reports"
--      ON service_reports FOR ALL
--      USING (technician_id = auth.uid());
-- ============================================================

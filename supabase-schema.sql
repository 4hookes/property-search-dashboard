-- Property Search Dashboard — Supabase Schema
-- Run this in your Supabase SQL Editor

-- 1. Client searches (one per client engagement)
CREATE TABLE client_searches (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name           TEXT NOT NULL,
  client_slug           TEXT NOT NULL UNIQUE,
  client_password_hash  TEXT NOT NULL,
  search_criteria       JSONB,
  is_active             BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- 2. Properties (all listings, any status)
CREATE TABLE properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id       UUID NOT NULL REFERENCES client_searches(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'Automation',
  project_name    TEXT,
  agent_name      TEXT,
  agent_number    TEXT,
  price           BIGINT,
  price_condition TEXT,
  search_date     DATE,
  listed_date     DATE,
  street_address  TEXT,
  mrt_distance    TEXT,
  beds            INTEGER,
  baths           INTEGER,
  size_sqft       INTEGER,
  psf             INTEGER,
  property_type   TEXT,
  floor_level     TEXT,
  tenanted        TEXT,
  listing_id      TEXT,
  source          TEXT DEFAULT 'PropertyGuru',
  description     TEXT,
  property_link   TEXT,
  summary         TEXT,
  whatsapp_link   TEXT,
  viewing_datetime TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 3. Property images
CREATE TABLE property_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  storage_path  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 4. Property notes
CREATE TABLE property_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_properties_search_id ON properties(search_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_notes_property_id ON property_notes(property_id);

-- Row Level Security (optional — disable if using service role only)
ALTER TABLE client_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_notes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use service role)
CREATE POLICY "Service role full access" ON client_searches FOR ALL USING (true);
CREATE POLICY "Service role full access" ON properties FOR ALL USING (true);
CREATE POLICY "Service role full access" ON property_images FOR ALL USING (true);
CREATE POLICY "Service role full access" ON property_notes FOR ALL USING (true);

-- Storage bucket for property images
-- Run this separately or via Supabase dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

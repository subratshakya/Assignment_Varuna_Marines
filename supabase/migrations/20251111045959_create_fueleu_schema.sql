/*
  # FuelEU Maritime Compliance Platform Schema

  ## Overview
  This migration creates the complete database schema for the FuelEU Maritime compliance platform,
  including tables for routes, ship compliance, banking, and pooling functionality.

  ## New Tables

  ### 1. routes
  Stores maritime route data with fuel consumption and emissions information.
  - `id` (uuid, primary key) - Internal record identifier
  - `route_id` (text, unique) - External route identifier (e.g., R001)
  - `vessel_type` (text) - Type of vessel (Container, BulkCarrier, Tanker, RoRo)
  - `fuel_type` (text) - Fuel type used (HFO, LNG, MGO)
  - `year` (integer) - Compliance year
  - `ghg_intensity` (numeric) - GHG intensity in gCO₂e/MJ
  - `fuel_consumption` (numeric) - Fuel consumption in tonnes
  - `distance` (numeric) - Distance traveled in kilometers
  - `total_emissions` (numeric) - Total emissions in tonnes
  - `is_baseline` (boolean) - Whether this route is set as baseline
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 2. ship_compliance
  Stores computed Compliance Balance (CB) records for ships.
  - `id` (uuid, primary key) - Internal record identifier
  - `ship_id` (text) - Ship identifier
  - `year` (integer) - Compliance year
  - `cb_gco2eq` (numeric) - Compliance balance in gCO₂eq (positive = surplus, negative = deficit)
  - `target_intensity` (numeric) - Target GHG intensity for the year
  - `actual_intensity` (numeric) - Actual GHG intensity achieved
  - `energy_in_scope` (numeric) - Energy in scope (MJ)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 3. bank_entries
  Stores banked surplus CB that can be applied to future deficits.
  - `id` (uuid, primary key) - Internal record identifier
  - `ship_id` (text) - Ship identifier
  - `year` (integer) - Year when surplus was banked
  - `amount_gco2eq` (numeric) - Amount banked in gCO₂eq (always positive)
  - `remaining_gco2eq` (numeric) - Remaining amount available to apply
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. pools
  Registry of pooling arrangements between ships.
  - `id` (uuid, primary key) - Internal pool identifier
  - `year` (integer) - Compliance year for the pool
  - `created_at` (timestamptz) - Pool creation timestamp

  ### 5. pool_members
  Tracks individual ship participation in pools with before/after CB values.
  - `id` (uuid, primary key) - Internal record identifier
  - `pool_id` (uuid, foreign key) - References pools table
  - `ship_id` (text) - Ship identifier
  - `cb_before` (numeric) - CB before pooling in gCO₂eq
  - `cb_after` (numeric) - CB after pooling in gCO₂eq
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  All tables have Row Level Security (RLS) enabled with policies for authenticated users.
  In production, these policies should be refined based on actual user roles and permissions.

  ## Indexes
  - Composite indexes on (ship_id, year) for efficient compliance lookups
  - Index on route_id for quick route lookups
  - Index on is_baseline for baseline queries
  - Index on pool_id for efficient pool member queries

  ## Important Notes
  1. All monetary/quantity fields use numeric type for precision
  2. Timestamps include timezone information (timestamptz)
  3. Foreign key constraints ensure referential integrity
  4. Default values set for timestamps and boolean fields
*/

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id text UNIQUE NOT NULL,
  vessel_type text NOT NULL,
  fuel_type text NOT NULL,
  year integer NOT NULL,
  ghg_intensity numeric(10, 4) NOT NULL,
  fuel_consumption numeric(12, 2) NOT NULL,
  distance numeric(12, 2) NOT NULL,
  total_emissions numeric(12, 2) NOT NULL,
  is_baseline boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ship_compliance table
CREATE TABLE IF NOT EXISTS ship_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id text NOT NULL,
  year integer NOT NULL,
  cb_gco2eq numeric(15, 2) NOT NULL,
  target_intensity numeric(10, 4) NOT NULL,
  actual_intensity numeric(10, 4) NOT NULL,
  energy_in_scope numeric(15, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(ship_id, year)
);

-- Create bank_entries table
CREATE TABLE IF NOT EXISTS bank_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id text NOT NULL,
  year integer NOT NULL,
  amount_gco2eq numeric(15, 2) NOT NULL CHECK (amount_gco2eq > 0),
  remaining_gco2eq numeric(15, 2) NOT NULL CHECK (remaining_gco2eq >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create pools table
CREATE TABLE IF NOT EXISTS pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create pool_members table
CREATE TABLE IF NOT EXISTS pool_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  ship_id text NOT NULL,
  cb_before numeric(15, 2) NOT NULL,
  cb_after numeric(15, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_routes_route_id ON routes(route_id);
CREATE INDEX IF NOT EXISTS idx_routes_baseline ON routes(is_baseline) WHERE is_baseline = true;
CREATE INDEX IF NOT EXISTS idx_routes_year ON routes(year);
CREATE INDEX IF NOT EXISTS idx_ship_compliance_ship_year ON ship_compliance(ship_id, year);
CREATE INDEX IF NOT EXISTS idx_bank_entries_ship_year ON bank_entries(ship_id, year);
CREATE INDEX IF NOT EXISTS idx_pool_members_pool_id ON pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_pools_year ON pools(year);

-- Enable Row Level Security
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ship_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can read routes"
  ON routes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert routes"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update routes"
  ON routes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read ship_compliance"
  ON ship_compliance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ship_compliance"
  ON ship_compliance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ship_compliance"
  ON ship_compliance FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read bank_entries"
  ON bank_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert bank_entries"
  ON bank_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bank_entries"
  ON bank_entries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read pools"
  ON pools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert pools"
  ON pools FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read pool_members"
  ON pool_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert pool_members"
  ON pool_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

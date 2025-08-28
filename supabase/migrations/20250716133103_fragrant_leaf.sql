/*
  # Ocean Watch Database Schema

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text) - Type de pollution
      - `description` (text) - Description du signalement
      - `location_lat` (numeric) - Latitude
      - `location_lng` (numeric) - Longitude
      - `location_address` (text) - Adresse lisible
      - `photo_url` (text, optional) - URL de la photo
      - `status` (text) - Statut du signalement
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_profiles`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `user_type` (text) - Type d'utilisateur
      - `organization_name` (text, optional) - Nom de l'organisation
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for different user types
    - Public read access for reports (citizens can see all reports)
    - Authenticated users can create reports
    - Only organization users can update report status

  3. Storage
    - Create bucket for report photos
    - Set up policies for photo upload/access
*/

-- Create custom types
CREATE TYPE user_type_enum AS ENUM ('citizen', 'organization');
CREATE TYPE report_status_enum AS ENUM ('new', 'in-progress', 'resolved');
CREATE TYPE pollution_type_enum AS ENUM ('plastic', 'hydrocarbons', 'organic', 'chemicals', 'other');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type_enum NOT NULL DEFAULT 'citizen',
  organization_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type pollution_type_enum NOT NULL,
  description text NOT NULL,
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  location_address text NOT NULL,
  photo_url text,
  status report_status_enum NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Reports policies
CREATE POLICY "Anyone can read reports"
  ON reports
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Report authors can update their reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Organizations can update report status"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND user_type = 'organization'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Create storage bucket for report photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for report photos
CREATE POLICY "Anyone can view report photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'report-photos');

CREATE POLICY "Authenticated users can upload report photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'report-photos');

CREATE POLICY "Users can update their own photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, user_type)
  VALUES (new.id, 'citizen');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
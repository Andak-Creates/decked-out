-- Create premium_status table for tracking user premium subscriptions
-- Run this in your Supabase SQL Editor if the table doesn't exist

CREATE TABLE IF NOT EXISTS premium_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN DEFAULT false,
  premium_type TEXT, -- 'temporary' or 'subscription'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_premium_status_user_id ON premium_status(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_status_is_premium ON premium_status(is_premium);

-- Enable Row Level Security
ALTER TABLE premium_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own premium status" ON premium_status;
DROP POLICY IF EXISTS "Users can update their own premium status" ON premium_status;
DROP POLICY IF EXISTS "Users can insert their own premium status" ON premium_status;

-- Create policy to allow users to read their own premium status
CREATE POLICY "Users can view their own premium status"
  ON premium_status
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to update their own premium status
CREATE POLICY "Users can update their own premium status"
  ON premium_status
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to insert their own premium status
CREATE POLICY "Users can insert their own premium status"
  ON premium_status
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow upsert (insert or update)
CREATE POLICY "Users can upsert their own premium status"
  ON premium_status
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


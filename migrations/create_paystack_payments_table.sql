-- Create paystack_payments table for tracking Paystack payments
CREATE TABLE IF NOT EXISTS paystack_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_identifier TEXT NOT NULL,
  payment_reference TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in kobo (smallest currency unit)
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_paystack_payments_user_id ON paystack_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_paystack_payments_reference ON paystack_payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_paystack_payments_status ON paystack_payments(status);

-- Enable Row Level Security
ALTER TABLE paystack_payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own payments
CREATE POLICY "Users can view their own payments"
  ON paystack_payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow service role to insert/update payments
-- (This will be used by your backend API)
CREATE POLICY "Service role can manage payments"
  ON paystack_payments
  FOR ALL
  USING (true)
  WITH CHECK (true);


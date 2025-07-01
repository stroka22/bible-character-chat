-- Subscription Schema for Bible Character Chat
-- Migration: 20250625_subscription_schema

-- Add subscription fields to the existing users table
ALTER TABLE users
ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free',
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN payment_method_id TEXT;

-- Create subscriptions table to track payment history
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL, -- e.g., 'active', 'canceled', 'past_due', 'trialing'
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  price_id TEXT, -- Stripe Price ID
  product_id TEXT, -- Stripe Product ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  CONSTRAINT unique_stripe_subscription UNIQUE (stripe_subscription_id)
);

-- Create indexes for subscriptions table
CREATE INDEX idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions (stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions (stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);

-- Create trigger to automatically update updated_at for subscriptions table
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on new subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions table
-- Allow users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert/update/delete their own subscriptions (for development)
-- In production, these would typically be managed by webhooks from Stripe
CREATE POLICY "Allow authenticated inserts on subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated updates on subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow authenticated deletes on subscriptions" ON subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- SQL schema for IGROW registration and wallet backend
-- This schema is based on the app's current in-memory store and API models.

-- Registrations table stores user records created by the registration flow.
CREATE TABLE registrations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT '',
  email VARCHAR(255) NOT NULL UNIQUE,
  address TEXT DEFAULT '',
  program VARCHAR(255) DEFAULT '',
  plan_amount INTEGER NOT NULL DEFAULT 0,
  referral_name VARCHAR(255) DEFAULT '',
  referral_code VARCHAR(255) DEFAULT '',
  password VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ NULL,
  rejection_reason TEXT DEFAULT '',
  wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  parent_id VARCHAR(50) NULL,
  side VARCHAR(10) DEFAULT '',
  left_child_id VARCHAR(50) NULL,
  right_child_id VARCHAR(50) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registrations_parent_id ON registrations(parent_id);
CREATE INDEX idx_registrations_left_child_id ON registrations(left_child_id);
CREATE INDEX idx_registrations_right_child_id ON registrations(right_child_id);
CREATE INDEX idx_registrations_status ON registrations(status);

-- Top-up history is stored per user and may include user top-ups and admin credits.
CREATE TABLE topup_history (
  id VARCHAR(50) PRIMARY KEY,
  registration_id VARCHAR(50) NOT NULL REFERENCES registrations(id),
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(20) NOT NULL DEFAULT 'USDT',
  date DATE NOT NULL,
  source VARCHAR(255) NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topup_history_registration_id ON topup_history(registration_id);

-- Recharge requests submitted by users and processed by admins.
CREATE TABLE recharge_requests (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES registrations(id),
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(20) NOT NULL DEFAULT 'USDT',
  method VARCHAR(100) NOT NULL DEFAULT 'Crypto Wallet',
  note TEXT DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  requested_at DATE NOT NULL,
  approved_by VARCHAR(255) DEFAULT '',
  approved_at TIMESTAMPTZ NULL,
  rejected_by VARCHAR(255) DEFAULT '',
  rejected_at TIMESTAMPTZ NULL,
  rejection_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recharge_requests_user_id ON recharge_requests(user_id);
CREATE INDEX idx_recharge_requests_status ON recharge_requests(status);

-- Optional auth users table for the generic /api/auth/register flow.
CREATE TABLE auth_users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional admin users table for future admin persistence.
CREATE TABLE admin_users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

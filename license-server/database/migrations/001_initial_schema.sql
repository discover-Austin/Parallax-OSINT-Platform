-- Initial schema migration
-- This file is the same as schema.sql and is provided for migration tracking

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_key VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'pro', 'team', 'enterprise')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked', 'expired')),
    max_activations INTEGER NOT NULL DEFAULT 1,
    current_activations INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    notes TEXT
);

-- Activations table
CREATE TABLE IF NOT EXISTS activations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    activation_token VARCHAR(64) UNIQUE NOT NULL,
    machine_fingerprint VARCHAR(64) NOT NULL,
    machine_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    app_version VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
    activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deactivated_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT
);

-- Validation logs table
CREATE TABLE IF NOT EXISTS validation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
    activation_id UUID REFERENCES activations(id) ON DELETE SET NULL,
    validation_type VARCHAR(20) NOT NULL CHECK (validation_type IN ('activate', 'validate', 'deactivate')),
    result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'failure')),
    error_message TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Gumroad sales table
CREATE TABLE IF NOT EXISTS gumroad_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id VARCHAR(255) UNIQUE NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    quantity INTEGER NOT NULL DEFAULT 1,
    license_key VARCHAR(30),
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    sale_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    raw_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(email);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_created_at ON licenses(created_at);
CREATE INDEX IF NOT EXISTS idx_activations_license_id ON activations(license_id);
CREATE INDEX IF NOT EXISTS idx_activations_status ON activations(status);
CREATE INDEX IF NOT EXISTS idx_activations_machine_fingerprint ON activations(machine_fingerprint);
CREATE INDEX IF NOT EXISTS idx_validation_logs_license_id ON validation_logs(license_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_activation_id ON validation_logs(activation_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_created_at ON validation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_gumroad_sales_email ON gumroad_sales(email);
CREATE INDEX IF NOT EXISTS idx_gumroad_sales_processed ON gumroad_sales(processed);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_licenses_updated_at
    BEFORE UPDATE ON licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

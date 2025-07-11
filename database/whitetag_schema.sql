-- WhiteTag Pet Tracking App Database Schema (PostgreSQL/Supabase)
-- Created: 2024
-- Description: Complete database schema for pet ID tag and recovery system

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS qr_scans CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- ================================
-- USERS TABLE
-- ================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    instagram VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_demo BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_active ON users(is_active);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SUBSCRIPTIONS TABLE
-- ================================
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) DEFAULT 'annual' CHECK (plan_type IN ('annual', 'monthly')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    amount NUMERIC(10,2) NOT NULL DEFAULT 599.00,
    currency VARCHAR(3) DEFAULT 'INR',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for subscriptions table
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- PETS TABLE
-- ================================
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Dog', 'Cat', 'Bird', 'Rabbit', 'Other')),
    breed VARCHAR(100),
    age VARCHAR(20),
    color TEXT,
    description TEXT,
    photo_url VARCHAR(500),
    
    -- Privacy Settings
    show_phone BOOLEAN DEFAULT TRUE,
    show_whatsapp BOOLEAN DEFAULT TRUE,
    show_instagram BOOLEAN DEFAULT TRUE,
    show_address BOOLEAN DEFAULT FALSE,
    
    -- QR Code & Analytics
    qr_code_generated BOOLEAN DEFAULT FALSE,
    qr_code_url VARCHAR(500),
    total_scans INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_lost BOOLEAN DEFAULT FALSE,
    lost_date TIMESTAMPTZ,
    found_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for pets table
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pets_username ON pets(username);
CREATE INDEX idx_pets_type ON pets(type);
CREATE INDEX idx_pets_active ON pets(is_active);
CREATE INDEX idx_pets_lost ON pets(is_lost);

-- Create trigger for updated_at
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- QR CODE SCANS TABLE
-- ================================
CREATE TABLE qr_scans (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    scanner_ip VARCHAR(45),
    scanner_location_lat NUMERIC(10,8),
    scanner_location_lng NUMERIC(11,8),
    scanner_user_agent TEXT,
    scanner_country VARCHAR(100),
    scanner_city VARCHAR(100),
    whatsapp_shared BOOLEAN DEFAULT FALSE,
    whatsapp_shared_at TIMESTAMPTZ,
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for qr_scans table
CREATE INDEX idx_qr_scans_pet_id ON qr_scans(pet_id);
CREATE INDEX idx_qr_scans_scanned_at ON qr_scans(scanned_at);
CREATE INDEX idx_qr_scans_location ON qr_scans(scanner_location_lat, scanner_location_lng);

-- ================================
-- ADMINS TABLE
-- ================================
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'support')),
    permissions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for admins table
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_active ON admins(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SUPPORT TICKETS TABLE
-- ================================
CREATE TABLE support_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    pet_id INTEGER REFERENCES pets(id) ON DELETE SET NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(20) DEFAULT 'other' CHECK (category IN ('technical', 'billing', 'lost_pet', 'account', 'other')),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Create indexes for support_tickets table
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SAMPLE DATA INSERTS
-- ================================

-- Insert Demo Admin
-- Password: admin123
INSERT INTO admins (email, password_hash, name, role, permissions) VALUES
('admin@whitetag.com', '$2b$10$vcNQkqJTBoYqDLnd1QPlJegjrrs0qlJ2dlQ14BIq/mj7oM0XRK4ye', 'WhiteTag Admin', 'super_admin', '{"users": "full", "pets": "full", "subscriptions": "full", "analytics": "full"}');

-- Insert Demo Users
-- Demo password: demo123, Jagannath password: password123
INSERT INTO users (email, password_hash, name, phone, whatsapp, instagram, address, is_demo) VALUES
('demo@whitetag.com', '$2b$10$HAChsNhyDOX6NjRnm1y6/.9RbpiwaveqBicAwETx5Eb7hUTfx0LNy', 'Demo User', '+91 9876543210', '+91 9876543210', '@demo_user', 'Demo Address, Kochi, Kerala, India', TRUE),
('jagannath@whitetag.com', '$2b$10$Hb8zHSytD1xWYXxGqlLLQ.moBgjC/WJE4JgKJAx0emG12tCeAMHaG', 'Jagannath P S', '+91 9645671184', '+91 9645671184', '@jagannath_p_s', 'Kochi, Kerala, India', FALSE);

-- Insert Demo Subscriptions
INSERT INTO subscriptions (user_id, plan_type, status, amount, start_date, end_date, payment_method) VALUES
(1, 'annual', 'active', 599.00, '2024-01-01', '2024-12-31', 'demo'),
(2, 'annual', 'active', 599.00, '2024-01-15', '2025-01-15', 'upi');

-- Insert Demo Pets
INSERT INTO pets (user_id, name, username, type, breed, age, color, description, photo_url, qr_code_generated) VALUES
(1, 'Fluffy', 'fluffy_the_cat', 'Cat', 'Persian', '3 years', 'White with grey patches', 'Very friendly and loves belly rubs. Responds to the name Fluffy. Has a small scar on left ear.', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=500&fit=crop', TRUE),
(1, 'Bruno', 'bruno_golden', 'Dog', 'Golden Retriever', '5 years', 'Golden', 'Friendly dog who loves playing fetch. Very social with other dogs and people.', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop', FALSE),
(2, 'Whiskers', 'whiskers_siamese', 'Cat', 'Siamese', '2 years', 'Cream with dark points', 'Shy but affectionate cat. Likes quiet spaces and gentle petting.', 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&h=500&fit=crop', TRUE);

-- Insert Demo QR Scans
INSERT INTO qr_scans (pet_id, scanner_ip, scanner_location_lat, scanner_location_lng, scanner_city, whatsapp_shared) VALUES
(1, '192.168.1.100', 9.9312, 76.2673, 'Kochi', TRUE),
(1, '203.192.217.210', 19.0760, 72.8777, 'Mumbai', FALSE),
(3, '106.51.75.142', 28.7041, 77.1025, 'Delhi', TRUE);

-- Update pet scan counts
UPDATE pets SET total_scans = 2, last_scanned_at = NOW() WHERE id = 1;
UPDATE pets SET total_scans = 1, last_scanned_at = NOW() WHERE id = 3;

-- Insert Demo Support Ticket
INSERT INTO support_tickets (user_id, pet_id, subject, description, status, category, contact_email) VALUES
(2, 3, 'Pet Tag Not Scanning', 'The QR code on my pet tag is not scanning properly. When people try to scan it, they get an error message.', 'open', 'technical', 'jagannath@whitetag.com');

-- ================================
-- USEFUL QUERIES FOR DEVELOPMENT
-- ================================

-- View all users with their subscription status
-- SELECT u.name, u.email, u.phone, s.status, s.end_date FROM users u LEFT JOIN subscriptions s ON u.id = s.user_id;

-- View all pets with owner information
-- SELECT p.name as pet_name, p.username, p.type, p.breed, u.name as owner_name, u.phone FROM pets p JOIN users u ON p.user_id = u.id;

-- View QR scan analytics
-- SELECT p.name, p.username, p.total_scans, COUNT(qs.id) as scan_events FROM pets p LEFT JOIN qr_scans qs ON p.id = qs.pet_id GROUP BY p.id;

-- Check expired subscriptions
-- SELECT u.name, u.email, s.end_date FROM users u JOIN subscriptions s ON u.id = s.user_id WHERE s.end_date < CURRENT_DATE AND s.status = 'active';

-- ================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ================================

-- Composite indexes for common query patterns
CREATE INDEX idx_pets_user_active ON pets(user_id, is_active);
CREATE INDEX idx_subscriptions_status_end ON subscriptions(status, end_date);
CREATE INDEX idx_qr_scans_pet_date ON qr_scans(pet_id, scanned_at);

-- ================================
-- COMPLETION MESSAGE
-- ================================
SELECT 'WhiteTag Database Schema Created Successfully!' as message; 
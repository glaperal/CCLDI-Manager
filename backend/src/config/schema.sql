-- CCLDI Student Management System Database Schema
-- PostgreSQL

-- Drop tables if they exist (for development/testing)
DROP TABLE IF EXISTS billing CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS centers CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Centers table
CREATE TABLE centers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('corporate', 'franchise')),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age <= 18),
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female')),
  parent VARCHAR(255) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  center_id VARCHAR(50) NOT NULL REFERENCES centers(id) ON DELETE RESTRICT,
  tuition DECIMAL(10, 2) NOT NULL CHECK (tuition >= 0),
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Billing/Payments table
CREATE TABLE billing (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('tuition', 'miscellaneous')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  month_for VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'partial', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settings table (key-value store)
CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_students_center ON students(center_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_enrollment_date ON students(enrollment_date);
CREATE INDEX idx_billing_student ON billing(student_id);
CREATE INDEX idx_billing_date ON billing(payment_date);
CREATE INDEX idx_billing_month ON billing(month_for);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_centers_updated_at BEFORE UPDATE ON centers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default centers
INSERT INTO centers (id, name, type, capacity) VALUES
('alabang', 'Alabang Corporate Center', 'corporate', 120),
('makati-legaspi', 'Makati Legaspi Corporate Center', 'corporate', 100),
('makati-salcedo', 'Makati Salcedo Corporate Center', 'corporate', 90),
('ortigas', 'Ortigas Corporate Center', 'corporate', 110),
('bgc', 'BGC Corporate Center', 'corporate', 130),
('qc-eastwood', 'QC Eastwood Corporate Center', 'corporate', 95),
('qc-vertis', 'QC Vertis North Corporate Center', 'corporate', 105),
('pasig', 'Pasig Corporate Center', 'corporate', 85),
('mandaluyong', 'Mandaluyong Corporate Center', 'corporate', 100),
('paranaque', 'Paranaque Corporate Center', 'corporate', 80),
('taguig', 'Taguig Corporate Center', 'corporate', 90),
('cebu', 'Cebu Franchise', 'franchise', 150),
('davao', 'Davao Franchise', 'franchise', 140),
('baguio', 'Baguio Franchise', 'franchise', 100),
('iloilo', 'Iloilo Franchise', 'franchise', 110),
('cagayan', 'Cagayan de Oro Franchise', 'franchise', 120);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('capacity_warning_threshold', '70', 'Alert when center capacity falls below this percentage'),
('ar_warning_threshold', '10', 'Alert when AR rate exceeds this percentage');

-- Insert sample students (optional - for testing)
INSERT INTO students (first_name, last_name, age, gender, parent, contact, email, center_id, tuition, enrollment_date) VALUES
('Maria', 'Santos', 5, 'Female', 'Juan Santos', '09171234567', 'juan.santos@email.com', 'alabang', 15000, '2024-01-15'),
('Jose', 'Reyes', 4, 'Male', 'Ana Reyes', '09182345678', 'ana.reyes@email.com', 'makati-legaspi', 16000, '2024-01-20'),
('Isabel', 'Cruz', 6, 'Female', 'Carlos Cruz', '09193456789', 'carlos.cruz@email.com', 'bgc', 18000, '2024-02-01');

-- Insert sample billing records (optional - for testing)
INSERT INTO billing (student_id, type, amount, payment_date, month_for, status) VALUES
(1, 'tuition', 15000, '2024-01-15', '2024-02', 'paid'),
(2, 'tuition', 16000, '2024-01-20', '2024-02', 'paid'),
(3, 'tuition', 18000, '2024-02-01', '2024-02', 'paid');

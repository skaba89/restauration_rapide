-- ============================================
-- Restaurant OS - Database Initialization
-- PostgreSQL initialization script
-- ============================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Set timezone
SET timezone = 'UTC';

-- Create enum types (if not exists)
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 
        'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 
        'CANCELLED', 'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'PENDING', 'PROCESSING', 'COMPLETED', 
        'FAILED', 'REFUNDED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'CASH', 'ORANGE_MONEY', 'MTN_MOMO', 'WAVE', 
        'MPESA', 'CARD', 'BANK_TRANSFER', 'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM (
        'PENDING', 'ASSIGNED', 'PICKED_UP', 
        'IN_TRANSIT', 'DELIVERED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
-- These will be created by Prisma migrate, but we add additional ones here

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON "Order"(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON "Order"(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON "Order"(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON "Order"(customer_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON "Payment"(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON "Payment"(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON "Payment"(method);

CREATE INDEX IF NOT EXISTS idx_customers_email ON "Customer"(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON "Customer"(phone);

CREATE INDEX IF NOT EXISTS idx_products_restaurant_id ON "Product"(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON "Product"(category_id);

-- Full-text search index for products
CREATE INDEX IF NOT EXISTS idx_products_name_search ON "Product" USING gin(name gin_trgm_ops);

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Restaurant OS database initialized successfully';
END $$;

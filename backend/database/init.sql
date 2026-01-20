-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE centrepoint_dev SET "app.current_tenant" TO '';

-- Create initial schema
CREATE SCHEMA IF NOT EXISTS public;

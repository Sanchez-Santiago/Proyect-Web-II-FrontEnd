-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.AiAnalysis (
  id text NOT NULL,
  condition text NOT NULL,
  estimatedPrice double precision,
  damageReport text,
  confidence double precision,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vehicleId text NOT NULL,
  CONSTRAINT AiAnalysis_pkey PRIMARY KEY (id),
  CONSTRAINT AiAnalysis_vehicleId_fkey FOREIGN KEY (vehicleId) REFERENCES public.Vehicle(id)
);
CREATE TABLE public.Favorite (
  id text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userId text NOT NULL,
  vehicleId text NOT NULL,
  CONSTRAINT Favorite_pkey PRIMARY KEY (id),
  CONSTRAINT Favorite_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT Favorite_vehicleId_fkey FOREIGN KEY (vehicleId) REFERENCES public.Vehicle(id)
);
CREATE TABLE public.Message (
  id text NOT NULL,
  message text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vehicleId text NOT NULL,
  senderId text NOT NULL,
  receiverId text NOT NULL,
  CONSTRAINT Message_pkey PRIMARY KEY (id),
  CONSTRAINT Message_vehicleId_fkey FOREIGN KEY (vehicleId) REFERENCES public.Vehicle(id),
  CONSTRAINT Message_senderId_fkey FOREIGN KEY (senderId) REFERENCES public.User(id),
  CONSTRAINT Message_receiverId_fkey FOREIGN KEY (receiverId) REFERENCES public.User(id)
);
CREATE TABLE public.User (
  id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'BUYER'::"UserRole",
  province text NOT NULL,
  city text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT User_pkey PRIMARY KEY (id)
);
CREATE TABLE public.UserPreference (
  id text NOT NULL,
  yearRange ARRAY DEFAULT ARRAY[]::integer[],
  mileageRange ARRAY DEFAULT ARRAY[]::integer[],
  colorRange ARRAY DEFAULT ARRAY[]::text[],
  interiorRange ARRAY DEFAULT ARRAY[]::integer[],
  paintRange ARRAY DEFAULT ARRAY[]::integer[],
  rimsRange ARRAY DEFAULT ARRAY[]::integer[],
  dashboardRange ARRAY DEFAULT ARRAY[]::integer[],
  tiresRange ARRAY DEFAULT ARRAY[]::integer[],
  fuelTypes ARRAY DEFAULT ARRAY[]::"FuelType"[],
  vehicleTypes ARRAY DEFAULT ARRAY[]::"VehicleType"[],
  brands ARRAY DEFAULT ARRAY[]::text[],
  models ARRAY DEFAULT ARRAY[]::text[],
  userId text NOT NULL,
  CONSTRAINT UserPreference_pkey PRIMARY KEY (id),
  CONSTRAINT UserPreference_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Vehicle (
  id text NOT NULL,
  vehicleType USER-DEFINED NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  color text,
  fuelType USER-DEFINED,
  transmission USER-DEFINED,
  mileage integer,
  price double precision,
  province text,
  city text,
  latitude double precision,
  longitude double precision,
  lastServiceDate date,
  lastOilChange date,
  accidents text,
  interiorCondition integer,
  paintCondition integer,
  rimsCondition integer,
  dashboardCondition integer,
  tiresCondition integer,
  description text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sellerId text NOT NULL,
  CONSTRAINT Vehicle_pkey PRIMARY KEY (id),
  CONSTRAINT Vehicle_sellerId_fkey FOREIGN KEY (sellerId) REFERENCES public.User(id)
);
CREATE TABLE public.VehicleImage (
  id text NOT NULL,
  url text NOT NULL,
  title text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vehicleId text NOT NULL,
  CONSTRAINT VehicleImage_pkey PRIMARY KEY (id),
  CONSTRAINT VehicleImage_vehicleId_fkey FOREIGN KEY (vehicleId) REFERENCES public.Vehicle(id)
);

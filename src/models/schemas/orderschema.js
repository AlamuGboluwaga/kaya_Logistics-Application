exports.truckAvailabilitySchema = `
 CREATE TABLE IF NOT EXISTS tbl_kp_truck_availabilities(
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   "ownedBy" UUID NOT NULL,
   client UUID NOT NULL,
   "loadingSite" VARCHAR(255) NOT NULL,
   "truckNo" VARCHAR(255) NOT NULL,
   "truckType" UUID NOT NULL,
   tonnage VARCHAR(100),
   driver UUID NOT NULL,
   product VARCHAR(255) NOT NULL,
   destination VARCHAR(255) NOT NULL,
   locations JSONB NOT NULL,
   status JSONB NOT NULL,
   "gatedIn" BOOLEAN DEFAULT FALSE,
   "gatedInAt" TIMESTAMP NULL,
   "gatedInBy" UUID NULL,
   "availabilityStatus" BOOLEAN DEFAULT TRUE,
   "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
   "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT kp_transporter FOREIGN KEY("ownedBy") REFERENCES users("id"),
   CONSTRAINT kp_client FOREIGN KEY(client) REFERENCES tbl_kp_clients("id"),
   CONSTRAINT kp_truck_type FOREIGN KEY("truckType") REFERENCES tbl_kp_truck_types("id"),
   CONSTRAINT kp_driver FOREIGN KEY(driver) REFERENCES tbl_kp_drivers("id"),
   CONSTRAINT kp_created_by FOREIGN KEY("gatedInBy") REFERENCES users("id")
 )
`;

exports.orderSchema = `
  CREATE TABLE IF NOT EXISTS tbl_kp_orders(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "availability" UUID NULL,
    "gatedInAt" TIMESTAMP NOT NULL,
    "orderId" VARCHAR(255) NOT NULL UNIQUE,
    "ownedBy" UUID NOT NULL,
    client UUID NOT NULL,
    "loadingSite" VARCHAR(255) NOT NULL,
    "truckNo" VARCHAR(255) NOT NULL,
    "truckType" UUID NOT NULL,
    tonnage VARCHAR(100),
    driver UUID NOT NULL,
    product VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    locations JSONB NOT NULL,
    "loadingStarted" TIMESTAMP NULL,
    "loadingEnded" TIMESTAMP NULL,
    "customerName" VARCHAR(255) NULL,
    "customerPhoneNo" VARCHAR(255) NULL,
    "customerAddress" TEXT NULL,
    "loadedWeight" VARCHAR(255) NULL,
    "tracker" INTEGER NOT NULL DEFAULT 1,
    "tripType" VARCHAR(255) NOT NULL,
    "tripStatus" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT kp_availability FOREIGN KEY("availability") REFERENCES tbl_kp_truck_availabilities(id) ON DELETE SET NULL,
    CONSTRAINT kp_transporter FOREIGN KEY("ownedBy") REFERENCES users("id"),
    CONSTRAINT kp_client FOREIGN KEY(client) REFERENCES tbl_kp_clients("id"),
    CONSTRAINT kp_truck_type FOREIGN KEY("truckType") REFERENCES tbl_kp_truck_types("id"),
    CONSTRAINT kp_driver FOREIGN KEY(driver) REFERENCES tbl_kp_drivers("id")
  )
`;

exports.alterOrderWaybillSchema = `
    ALTER TABLE tbl_kp_order_waybill 
      ADD COLUMN IF NOT EXISTS "verificationStatus" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "verificationRequestedBy" UUID NULL,
      ADD COLUMN IF NOT EXISTS "verificationRequestedAt" TIMESTAMP WITH TIME ZONE NULL,
      ADD COLUMN IF NOT EXISTS "approvalStatus" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "verifiedBy" UUID NULL,
      ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP WITH TIME ZONE NULL
`;


exports.orderWaybillSchema = `
  CREATE TABLE IF NOT EXISTS tbl_kp_order_waybill(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    waybill JSONB NOT NULL,
    "invoiceStatus" BOOLEAN DEFAULT FALSE,
    "invoiceDate" TIMESTAMP WITH TIME ZONE NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT kp_order_waybill FOREIGN KEY("orderId") REFERENCES tbl_kp_orders(id) ON DELETE SET NULL
  )
`;

exports.alterPaymentSchema = `
    ALTER TABLE tbl_kp_order_payments 
      ADD COLUMN IF NOT EXISTS  "isFinanced" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "kayaPayOut" REAL NULL,
      ADD COLUMN IF NOT EXISTS "kayaPayAdvance" REAL NULL,
      ADD COLUMN IF NOT EXISTS "kayaPayBalance" REAL NULL
`;

exports.orderPaymentSchema = `
  CREATE TABLE IF NOT EXISTS tbl_kp_order_payments(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "clientRate" REAL NOT NULL,
    "transporterRate" REAL NOT NULL,
    "incentive" JSONB NULL,
    "ago" REAL NULL,
    advance REAL NOT NULL,
    balance REAL NOT NULL,
    "advanceRequestedBy" VARCHAR(255) NULL,
    "advanceRequestedAt" TIMESTAMP WITH TIME ZONE NULL,
    "advancePaidAt" TIMESTAMP WITH TIME ZONE NULL,
    "balanceRequestedBy" VARCHAR(255) NULL,
    "balanceRequestedAt" TIMESTAMP WITH TIME ZONE NULL,
    "balancePaidAt" TIMESTAMP WITH TIME ZONE NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT kp_order_payment FOREIGN KEY("orderId") REFERENCES tbl_kp_orders(id) ON DELETE SET NULL
  )
`;

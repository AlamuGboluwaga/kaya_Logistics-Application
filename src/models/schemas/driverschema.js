exports.driverSchema = `
  CREATE TABLE IF NOT EXISTS tbl_kp_drivers(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NULL,
    "phoneNo" JSONB NOT NULL,
    "licenceNo" VARCHAR(255) NOT NULL,
    "licenceUrl" VARCHAR(255) NULL,
    "expiryDate" TIMESTAMP NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`
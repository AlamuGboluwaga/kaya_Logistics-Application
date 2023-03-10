const TRUCK_SCHEMA = `
  CREATE TABLE IF NOT EXISTS tbl_kp_trucks(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "truckNo" VARCHAR(150) NOT NULL,
    "truckType" VARCHAR(150) NOT NULL,
    tonnage VARCHAR(50) NOT NULL,
    updates JSONB NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`

module.exports = TRUCK_SCHEMA
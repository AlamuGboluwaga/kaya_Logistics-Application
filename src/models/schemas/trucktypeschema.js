const TRUCK_TYPE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS tbl_kp_truck_types(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "truckType" VARCHAR(255) NOT NULL,
    tonnage JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`

module.exports = TRUCK_TYPE_SCHEMA
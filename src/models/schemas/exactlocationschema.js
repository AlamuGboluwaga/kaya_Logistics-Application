const exactLocationSchema = `
  CREATE TABLE IF NOT EXISTS tbl_kp_exact_locations(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    state VARCHAR(255) NOT NULL,
    "exactLocations" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`

module.exports = exactLocationSchema
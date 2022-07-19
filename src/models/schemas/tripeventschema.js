const tripEventSchema = `
  CREATE TABLE IF NOT EXISTS tbl_kp_trip_events(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "currentDay" VARCHAR(100) NOT NULL, 
    "orderId" UUID NOT NULL,
    "eventHistory" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tbl_kp_trip_events FOREIGN KEY("orderId") REFERENCES tbl_kp_orders(id) ON DELETE SET NULL
  )
`;

module.exports = tripEventSchema
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
`

/*
collect gate in details,
time it arrived loading bay
time it took to finish loading
time it gated out
- all these are just for information purposes anyways...
*/
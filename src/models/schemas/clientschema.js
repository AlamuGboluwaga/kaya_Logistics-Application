exports.clientSchema = `
  CREATE TABLE IF NOT EXISTS tbl_kp_clients(
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "managedBy" UUID NULL,
    "companyName" VARCHAR(255) UNIQUE NOT NULL,
    "clientAlias" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NULL,
    "personOfContact" JSONB NULL,
    "address" JSONB,
    "products" JSONB NULL,
    "loadingSites" JSONB NULL,
    "payInto" JSONB,
    "clientStatus" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT kp_client_account_officer FOREIGN KEY("managedBy") REFERENCES users("id")
  )
`
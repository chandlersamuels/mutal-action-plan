-- Add PIN protection to share tokens
ALTER TABLE "MapShareToken" ADD COLUMN "pinCodeHash" TEXT;

-- Add client logo support
ALTER TABLE "Client" ADD COLUMN "logoUrl" TEXT;

-- AlterTable: change Deal.stage from DealStage enum to TEXT
ALTER TABLE "Deal" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "Deal" ALTER COLUMN "stage" TYPE TEXT;
ALTER TABLE "Deal" ALTER COLUMN "stage" SET DEFAULT 'DISCOVERY';

-- DropEnum
DROP TYPE IF EXISTS "DealStage";

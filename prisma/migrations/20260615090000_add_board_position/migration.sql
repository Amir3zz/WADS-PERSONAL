ALTER TABLE "Board" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

WITH ordered_boards AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" ASC
    ) - 1 AS "nextPosition"
  FROM "Board"
)
UPDATE "Board"
SET "position" = ordered_boards."nextPosition"
FROM ordered_boards
WHERE "Board"."id" = ordered_boards."id";

CREATE INDEX "Board_userId_position_idx" ON "Board"("userId", "position");

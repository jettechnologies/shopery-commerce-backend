ALTER TABLE "Product"
DROP COLUMN IF EXISTS search_vector;

ALTER TABLE "Product"
ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B')
) STORED;

CREATE INDEX product_search_idx
ON "Product"
USING GIN (search_vector);
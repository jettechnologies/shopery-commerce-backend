-- Add column
ALTER TABLE "Product"
ADD COLUMN search_vector tsvector;

-- Populate existing rows
UPDATE "Product"
SET search_vector =
  setweight(to_tsvector('english', name), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B');

-- Create index
CREATE INDEX product_search_idx
ON "Product"
USING GIN (search_vector);

-- Function to keep it updated
CREATE FUNCTION product_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', NEW.name), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER product_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Product"
FOR EACH ROW
EXECUTE FUNCTION product_search_vector_update();
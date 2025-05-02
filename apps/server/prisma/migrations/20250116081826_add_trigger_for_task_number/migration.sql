-- Create a sequence for task number
CREATE SEQUENCE task_number_seq;

-- Function to assign incremental number scoped by workspaceId
CREATE OR REPLACE FUNCTION update_task_number()
RETURNS TRIGGER AS $$
DECLARE
  max_number INT;
BEGIN
  IF NEW.number IS NULL THEN
    SELECT COALESCE(MAX(number), 0) + 1 INTO max_number
    FROM "Task"
    WHERE "workspaceId" = NEW."workspaceId";

    NEW.number := max_number;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before insert
CREATE TRIGGER set_task_number
BEFORE INSERT ON "Task"
FOR EACH ROW
WHEN (NEW.number IS NULL)
EXECUTE FUNCTION update_task_number();
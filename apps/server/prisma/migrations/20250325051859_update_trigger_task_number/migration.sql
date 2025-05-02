CREATE OR REPLACE FUNCTION get_task_number_sequence(workspace_id INT)
RETURNS TEXT AS $$
DECLARE
  seq_name TEXT;
BEGIN
  seq_name := 'task_number_seq_' || workspace_id;
  -- Create sequence if not exists
  EXECUTE FORMAT(
    'CREATE SEQUENCE IF NOT EXISTS %I START WITH 1;',
    seq_name
  );
  RETURN seq_name;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_task_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_name TEXT;
BEGIN
  IF NEW.number IS NULL THEN
    seq_name := get_task_number_sequence(NEW."workspaceId");
    EXECUTE FORMAT(
      'SELECT nextval(%L)',
      seq_name
    ) INTO NEW.number;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



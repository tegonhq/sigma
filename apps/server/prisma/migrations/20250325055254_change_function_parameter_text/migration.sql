CREATE OR REPLACE FUNCTION get_task_number_sequence(workspace_id varchar)
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


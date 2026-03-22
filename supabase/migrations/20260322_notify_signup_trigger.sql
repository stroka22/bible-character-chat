-- Trigger to notify on new user signup
-- Calls the notify-signup edge function when a new profile is created

CREATE OR REPLACE FUNCTION notify_new_signup()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
BEGIN
  -- Build the payload
  payload := json_build_object(
    'record', json_build_object(
      'id', NEW.id,
      'email', NEW.email,
      'display_name', NEW.display_name,
      'full_name', NEW.full_name,
      'created_at', NEW.created_at
    )
  );

  -- Call the edge function asynchronously using pg_net extension
  -- Note: This requires pg_net extension to be enabled in Supabase
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/notify-signup',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )::jsonb,
    body := payload::jsonb
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the signup if notification fails
  RAISE WARNING 'notify_new_signup failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_profile_created_notify ON profiles;
CREATE TRIGGER on_profile_created_notify
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_signup();

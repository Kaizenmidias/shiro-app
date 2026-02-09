-- Add last_reset_month to finance_settings for monthly reset logic
ALTER TABLE public.finance_settings 
ADD COLUMN IF NOT EXISTS last_reset_month INTEGER DEFAULT -1;

-- Add history column to user_game_profiles to store game history log
ALTER TABLE public.user_game_profiles
ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;

-- Ensure RLS policies are in place (already done in setup, but good to be safe if table was just created)

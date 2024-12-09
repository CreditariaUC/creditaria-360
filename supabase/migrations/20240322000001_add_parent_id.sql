-- Add parent_id column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES auth.users(id);

-- Create index for parent_id
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON profiles(parent_id);
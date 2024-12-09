-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_can_read_own_notifications" ON notifications;
DROP POLICY IF EXISTS "admins_can_create_notifications" ON notifications;
DROP POLICY IF EXISTS "users_can_update_own_notifications" ON notifications;

-- Update notifications table structure if needed
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS link TEXT,
  ADD COLUMN IF NOT EXISTS action_type TEXT CHECK (action_type IN ('view', 'action', 'dismiss')) DEFAULT 'view';

-- Create or replace updated policies
CREATE POLICY "users_can_read_own_notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admins_can_create_notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "users_can_update_own_notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
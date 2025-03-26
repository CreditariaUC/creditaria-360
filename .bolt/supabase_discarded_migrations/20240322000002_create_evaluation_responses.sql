-- Create evaluation_responses table
CREATE TABLE public.evaluation_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
    evaluation_participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    responses JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.evaluation_responses ENABLE ROW LEVEL SECURITY;

-- Create index for better query performance
CREATE INDEX idx_evaluation_responses_evaluation_id ON evaluation_responses(evaluation_id);
CREATE INDEX idx_evaluation_responses_participant_id ON evaluation_responses(evaluation_participant_id);

-- Policy for inserting responses
-- Users can only submit responses if they are participants in the evaluation
CREATE POLICY "users_can_submit_own_responses" ON evaluation_responses
    FOR INSERT WITH CHECK (
        evaluation_participant_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM evaluations
            WHERE id = evaluation_id
            AND evaluation_participant_id = ANY(participants)
        )
    );

-- Policy for reading responses
-- Users can read responses if they:
-- 1. Are the participant who submitted the response
-- 2. Are an admin
-- 3. Are the evaluated person in the evaluation
CREATE POLICY "users_can_read_authorized_responses" ON evaluation_responses
    FOR SELECT USING (
        evaluation_participant_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM evaluations
            WHERE id = evaluation_id
            AND evaluated_id = auth.uid()
        )
    );

-- Policy for updating responses
-- Users can only update their own responses within a time window (e.g., 24 hours)
CREATE POLICY "users_can_update_recent_responses" ON evaluation_responses
    FOR UPDATE USING (
        evaluation_participant_id = auth.uid() AND
        submitted_at > NOW() - INTERVAL '24 hours'
    )
    WITH CHECK (
        evaluation_participant_id = auth.uid() AND
        submitted_at > NOW() - INTERVAL '24 hours'
    );

-- Policy for deleting responses
-- Only admins can delete responses
CREATE POLICY "admins_can_delete_responses" ON evaluation_responses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_evaluation_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_evaluation_responses_timestamp
    BEFORE UPDATE ON evaluation_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_evaluation_responses_updated_at();

-- Create unique constraint to prevent multiple responses from same participant
ALTER TABLE evaluation_responses
ADD CONSTRAINT unique_participant_evaluation
UNIQUE (evaluation_id, evaluation_participant_id);
-- Add source_plan_id to reading_plans for copy-on-write tracking
-- This allows orgs to have customized copies of default plans

-- Add source_plan_id column to track which plan this was copied from
ALTER TABLE reading_plans ADD COLUMN IF NOT EXISTS source_plan_id UUID REFERENCES reading_plans(id) ON DELETE SET NULL;

-- Index for finding source plans
CREATE INDEX IF NOT EXISTS idx_reading_plans_source ON reading_plans(source_plan_id);

-- Similarly for plan days - track source when copying a plan
ALTER TABLE reading_plan_days ADD COLUMN IF NOT EXISTS source_day_id UUID REFERENCES reading_plan_days(id) ON DELETE SET NULL;

-- Index for finding source days
CREATE INDEX IF NOT EXISTS idx_reading_plan_days_source ON reading_plan_days(source_day_id);

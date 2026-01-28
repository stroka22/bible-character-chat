-- Add day1_context column to reading_plans table
-- Date: 2026-01-28
-- This column stores educational context for Day 1 of each reading plan

ALTER TABLE public.reading_plans 
ADD COLUMN IF NOT EXISTS day1_context TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN public.reading_plans.day1_context IS 'Educational context and background information displayed on Day 1 of the reading plan';

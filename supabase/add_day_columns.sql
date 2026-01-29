-- Add day context columns if they don't exist
ALTER TABLE public.reading_plans 
ADD COLUMN IF NOT EXISTS day5_context TEXT,
ADD COLUMN IF NOT EXISTS day6_context TEXT,
ADD COLUMN IF NOT EXISTS day7_context TEXT,
ADD COLUMN IF NOT EXISTS day8_context TEXT,
ADD COLUMN IF NOT EXISTS day9_context TEXT,
ADD COLUMN IF NOT EXISTS day10_context TEXT;

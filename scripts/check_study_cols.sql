-- Check if the new columns exist in the bible_studies table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bible_studies' 
AND column_name IN ('subject','character_instructions') 
ORDER BY column_name;

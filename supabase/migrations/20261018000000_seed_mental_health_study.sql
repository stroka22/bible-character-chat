-- Seed: Finding Hope - Coping with Mental Illness & Depression
-- A Bible study for those struggling with mental health challenges

-- Insert the study
DO $$
DECLARE
  study_uuid uuid;
  david_id uuid;
  elijah_id uuid;
  job_id uuid;
  paul_id uuid;
  jesus_id uuid;
BEGIN
  -- Only create if not exists
  IF NOT EXISTS (
    SELECT 1 FROM bible_studies
    WHERE owner_slug = 'faithtalkai'
      AND lower(title) LIKE '%mental%' OR lower(title) LIKE '%depression%'
  ) THEN
    
    -- Get character IDs
    SELECT id INTO david_id FROM characters WHERE lower(name) = 'david' LIMIT 1;
    SELECT id INTO elijah_id FROM characters WHERE lower(name) = 'elijah' LIMIT 1;
    SELECT id INTO job_id FROM characters WHERE lower(name) = 'job' LIMIT 1;
    SELECT id INTO paul_id FROM characters WHERE lower(name) = 'paul' LIMIT 1;
    SELECT id INTO jesus_id FROM characters WHERE lower(name) = 'jesus' LIMIT 1;
    
    -- Create the study
    INSERT INTO bible_studies (
      owner_slug, 
      title, 
      description, 
      subject, 
      visibility, 
      is_premium,
      character_id,
      character_instructions,
      study_type
    ) VALUES (
      'faithtalkai',
      'Finding Hope: Coping with Mental Illness & Depression',
      'A compassionate journey through Scripture exploring how biblical figures faced despair, anxiety, and dark seasons. Discover God''s presence in your struggles and find hope for healing.',
      'Mental Health, Depression, Anxiety, Hope',
      'public',
      false,
      david_id,
      'Approach this conversation with deep compassion and understanding. The person you''re speaking with may be struggling with mental health challenges. Be gentle, acknowledge their pain as real, and point them to hope without dismissing their struggles. Never suggest that faith alone cures mental illness - acknowledge that professional help is valuable and encouraged. Focus on God''s presence in suffering, not quick fixes.',
      'introduction'
    ) RETURNING id INTO study_uuid;
    
    -- Lesson 1: You Are Not Alone - David's Dark Nights
    INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, character_id, prompts) VALUES (
      study_uuid, 0,
      'You Are Not Alone - David''s Dark Nights',
      'David, the man after God''s own heart, experienced profound depression and anxiety. His Psalms reveal raw honesty about despair and God''s faithful presence.',
      '["Psalm 42:5-11", "Psalm 88:1-9", "Psalm 34:17-18"]',
      david_id,
      '[{"text": "David, you wrote about your soul being downcast. Can you describe what that darkness felt like?"}, {"text": "How did you find the strength to keep crying out to God even when He felt distant?"}, {"text": "What would you say to someone today who feels like God has forgotten them?"}]'
    );
    
    -- Lesson 2: When You Want to Give Up - Elijah's Exhaustion
    INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, character_id, prompts) VALUES (
      study_uuid, 1,
      'When You Want to Give Up - Elijah''s Exhaustion',
      'Even the great prophet Elijah reached a point of complete exhaustion and asked God to take his life. God''s response reveals how He meets us in our lowest moments.',
      '["1 Kings 19:1-18", "Psalm 46:10"]',
      elijah_id,
      '[{"text": "Elijah, after your great victory on Mount Carmel, you fled and wanted to die. What brought you to that breaking point?"}, {"text": "How did God respond to you - not with rebuke but with rest and food? What does that teach us?"}, {"text": "What helped you eventually get back up and continue your calling?"}]'
    );
    
    -- Lesson 3: Suffering Without Answers - Job's Anguish
    INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, character_id, prompts) VALUES (
      study_uuid, 2,
      'Suffering Without Answers - Job''s Anguish',
      'Job lost everything and struggled with friends who offered simplistic explanations for his pain. His story validates our questions while pointing to God''s mysterious presence.',
      '["Job 3:1-26", "Job 30:16-23", "Job 42:1-6"]',
      job_id,
      '[{"text": "Job, you cursed the day you were born. How do you respond to people who say that kind of honesty is wrong for believers?"}, {"text": "Your friends tried to explain your suffering. What was harmful about their approach?"}, {"text": "After encountering God, you found peace even without all the answers. How is that possible?"}]'
    );
    
    -- Lesson 4: A Thorn That Remains - Paul's Ongoing Struggle
    INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, character_id, prompts) VALUES (
      study_uuid, 3,
      'A Thorn That Remains - Paul''s Ongoing Struggle',
      'Paul prayed three times for God to remove his thorn in the flesh, but God said His grace was sufficient. This teaches us about finding strength in ongoing weakness.',
      '["2 Corinthians 12:7-10", "2 Corinthians 1:3-5", "2 Corinthians 4:7-9"]',
      paul_id,
      '[{"text": "Paul, you asked God three times to remove your struggle. How did you feel when He said no?"}, {"text": "How did you come to understand that God''s grace is sufficient even when healing doesn''t come?"}, {"text": "What does it mean practically to find strength in weakness?"}]'
    );
    
    -- Lesson 5: Jesus Understands - Gethsemane's Agony
    INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, character_id, prompts) VALUES (
      study_uuid, 4,
      'Jesus Understands - Gethsemane''s Agony',
      'In Gethsemane, Jesus experienced anguish so deep He sweat drops of blood. He understands our darkest moments because He lived through His own.',
      '["Matthew 26:36-46", "Hebrews 4:14-16", "Isaiah 53:3-4"]',
      jesus_id,
      '[{"text": "Jesus, in the garden you said your soul was overwhelmed with sorrow to the point of death. Help me understand what you experienced."}, {"text": "You asked the Father if there was another way. How does your honest prayer give us permission to be honest too?"}, {"text": "How does knowing you''ve suffered help those who feel no one understands their pain?"}]'
    );
    
    -- Lesson 6: The Body Matters - Rest, Care, and Community
    INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, character_id, prompts) VALUES (
      study_uuid, 5,
      'The Body Matters - Rest, Care, and Community',
      'God created us as whole beings - body, mind, and spirit. Scripture shows that physical care, rest, and community are part of healing.',
      '["1 Kings 19:5-8", "Ecclesiastes 4:9-12", "Galatians 6:2", "1 Corinthians 12:26"]',
      elijah_id,
      '[{"text": "Elijah, God sent an angel to give you food and water before anything else. Why do you think physical care came first?"}, {"text": "How important was it that God didn''t leave you alone but sent others to help you?"}, {"text": "What would you say to someone who feels guilty for needing help from others, including doctors and counselors?"}]'
    );
    
    -- Lesson 7: Lament as Worship - The Honesty God Welcomes
    INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, character_id, prompts) VALUES (
      study_uuid, 6,
      'Lament as Worship - The Honesty God Welcomes',
      'Nearly one-third of the Psalms are laments. God invites our raw, honest cries - not polished prayers that hide our pain.',
      '["Psalm 13:1-6", "Psalm 22:1-2", "Lamentations 3:1-26"]',
      david_id,
      '[{"text": "David, you asked God ''How long?'' and accused Him of hiding His face. Weren''t you afraid to be so honest?"}, {"text": "How is crying out to God in anguish actually a form of faith?"}, {"text": "Many people feel they have to pretend to be okay at church. What would you say to them?"}]'
    );
    
    -- Lesson 8: Hope for Tomorrow - Promises to Hold Onto
    INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, character_id, prompts) VALUES (
      study_uuid, 7,
      'Hope for Tomorrow - Promises to Hold Onto',
      'Scripture offers real hope - not that life will be easy, but that God is present, faithful, and working even when we can''t see it.',
      '["Romans 8:38-39", "Jeremiah 29:11", "Revelation 21:4", "Psalm 30:5", "Isaiah 41:10"]',
      jesus_id,
      '[{"text": "Jesus, for someone in deep darkness right now, what promises from the Father can they cling to?"}, {"text": "How do we hold onto hope when feelings don''t match the promises?"}, {"text": "What would you say to someone who is struggling today, right now, reading these words?"}]'
    );
    
    RAISE NOTICE 'Created Finding Hope study with ID: %', study_uuid;
  ELSE
    RAISE NOTICE 'Finding Hope study already exists, skipping creation';
  END IF;
END $$;

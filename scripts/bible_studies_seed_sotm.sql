-- =================================================================
-- Bible Studies Seed: Sermon on the Mount
-- =================================================================
-- Seeds a sample Bible study on the Sermon on the Mount with 4 lessons
-- Uses Jesus as the character guide

-- First, insert the main study if it doesn't exist yet
DO $$
DECLARE
  jesus_id uuid;
  v_study_id uuid;
BEGIN
  -- Find Jesus's character ID
  SELECT id INTO jesus_id FROM characters WHERE LOWER(name) LIKE '%jesus%' LIMIT 1;
  
  -- Only proceed if we found Jesus
  IF jesus_id IS NOT NULL THEN
    -- Check if study already exists
    SELECT id INTO v_study_id FROM bible_studies WHERE title = 'Sermon on the Mount' AND owner_slug = 'default';
    
    -- Insert study if it doesn't exist
    IF v_study_id IS NULL THEN
      INSERT INTO bible_studies (
        owner_slug,
        title,
        description,
        character_id,
        visibility,
        is_premium,
        cover_image_url
      ) VALUES (
        'default',
        'Sermon on the Mount',
        'Explore Jesus''s most famous teaching with this guided study through the Sermon on the Mount. Discover the transformative principles of the Kingdom of Heaven, from the Beatitudes to the Golden Rule.',
        jesus_id,
        'public',
        false,
        'https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      ) RETURNING id INTO v_study_id;
      
      RAISE NOTICE 'Created Sermon on the Mount study with ID: %', v_study_id;
    ELSE
      RAISE NOTICE 'Sermon on the Mount study already exists with ID: %', v_study_id;
    END IF;
    
    -- Now insert lessons if they don't exist
    
    -- Lesson 1: The Beatitudes
    IF NOT EXISTS (SELECT 1 FROM bible_study_lessons WHERE study_id = v_study_id AND title = 'The Beatitudes') THEN
      INSERT INTO bible_study_lessons (
        study_id,
        order_index,
        title,
        scripture_refs,
        summary,
        prompts
      ) VALUES (
        v_study_id,
        0,
        'The Beatitudes',
        ARRAY['Matthew 5:1-12'],
        'Jesus begins his sermon by describing the qualities of those who are blessed in God''s kingdom. These "Beatitudes" challenge conventional wisdom about happiness and success, revealing that God''s kingdom operates with different values than the world.',
        '[
          {"text": "Which Beatitude resonates most with you personally and why?"},
          {"text": "How do the Beatitudes challenge our modern understanding of happiness and success?"},
          {"text": "What does it mean to be \"poor in spirit\" or \"meek\" in today''s world?"}
        ]'::jsonb
      );
      RAISE NOTICE 'Created lesson: The Beatitudes';
    END IF;
    
    -- Lesson 2: Salt and Light
    IF NOT EXISTS (SELECT 1 FROM bible_study_lessons WHERE study_id = v_study_id AND title = 'Salt and Light') THEN
      INSERT INTO bible_study_lessons (
        study_id,
        order_index,
        title,
        scripture_refs,
        summary,
        prompts
      ) VALUES (
        v_study_id,
        1,
        'Salt and Light',
        ARRAY['Matthew 5:13-16'],
        'Jesus calls his followers to be "salt of the earth" and "light of the world." These metaphors illustrate how Christians should influence society while living distinctively from it. Our good works should point others to God.',
        '[
          {"text": "What does it mean to be \"salt\" in today''s culture?"},
          {"text": "How can believers let their light shine without appearing self-righteous?"},
          {"text": "In what specific ways can you be salt and light in your community this week?"}
        ]'::jsonb
      );
      RAISE NOTICE 'Created lesson: Salt and Light';
    END IF;
    
    -- Lesson 3: The Lord's Prayer
    IF NOT EXISTS (SELECT 1 FROM bible_study_lessons WHERE study_id = v_study_id AND title = 'The Lord''s Prayer') THEN
      INSERT INTO bible_study_lessons (
        study_id,
        order_index,
        title,
        scripture_refs,
        summary,
        prompts
      ) VALUES (
        v_study_id,
        2,
        'The Lord''s Prayer',
        ARRAY['Matthew 6:5-15'],
        'Jesus teaches his disciples how to pray, offering a model prayer that addresses God intimately while covering essential elements of prayer: worship, surrender to God''s will, provision for needs, forgiveness, and spiritual protection.',
        '[
          {"text": "What does it mean to pray \"Your kingdom come, Your will be done\"?"},
          {"text": "How does Jesus connect our forgiveness of others with God''s forgiveness of us?"},
          {"text": "How can the Lord''s Prayer become a meaningful framework for your own prayers?"}
        ]'::jsonb
      );
      RAISE NOTICE 'Created lesson: The Lord''s Prayer';
    END IF;
    
    -- Lesson 4: Wise and Foolish Builders
    IF NOT EXISTS (SELECT 1 FROM bible_study_lessons WHERE study_id = v_study_id AND title = 'Wise and Foolish Builders') THEN
      INSERT INTO bible_study_lessons (
        study_id,
        order_index,
        title,
        scripture_refs,
        summary,
        prompts
      ) VALUES (
        v_study_id,
        3,
        'Wise and Foolish Builders',
        ARRAY['Matthew 7:24-29'],
        'Jesus concludes his sermon with the parable of two builders - one who built on rock and another on sand. This powerful metaphor emphasizes that hearing Jesus'' teachings isn''t enough; we must put them into practice to withstand life''s storms.',
        '[
          {"text": "What \"storms\" have tested the foundation of your faith?"},
          {"text": "What is the difference between merely hearing Jesus'' words and actually doing them?"},
          {"text": "What specific teaching from the Sermon on the Mount do you find most challenging to apply?"}
        ]'::jsonb
      );
      RAISE NOTICE 'Created lesson: Wise and Foolish Builders';
    END IF;
    
  ELSE
    RAISE EXCEPTION 'Could not find Jesus character in the database';
  END IF;
END $$;

-- Bible Study: The Fear of the Lord — Walking in Holy Reverence
-- Created: 2026-03-15

DO $$
DECLARE
  study_id UUID;
BEGIN
  -- Insert the study
  INSERT INTO bible_studies (
    owner_slug,
    title,
    description,
    subject,
    character_id,
    character_instructions,
    visibility,
    is_premium,
    study_type
  ) VALUES (
    'default',
    'The Fear of the Lord — Walking in Holy Reverence',
    'To help believers understand what it truly means to fear God — not with terror, but with reverent awe, deep respect, and humble submission. This study explores how the fear of the Lord is the beginning of wisdom and transforms every area of life.',
    'Understanding Holy Reverence and Its Transforming Power',
    '8ee3c2c3-2840-491f-81b7-abcd32f2f0f2', -- Noah (intro character)
    'Approach this study with deep reverence for God''s holiness while emphasizing His love and mercy. Help participants understand that fearing God is not about being afraid of punishment, but about recognizing His majesty, power, and worthiness of our complete devotion. Theme Scripture: "The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding." — Proverbs 9:10',
    'public',
    false,
    'introduction'
  )
  RETURNING id INTO study_id;

  -- Introduction: Noah
  INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    0,
    'Introduction: What Does It Mean to Fear God?',
    'The fear of the Lord is one of the most misunderstood concepts in Scripture. This introduction distinguishes between unhealthy fear and holy reverence, showing how Noah''s life demonstrated what it means to walk in the fear of God.',
    ARRAY['Proverbs 9:10', 'Hebrews 11:7', 'Genesis 6:9-22'],
    ARRAY[
      'Begin by addressing common misconceptions about fearing God.',
      'Share how building the ark required both faith and reverent obedience.',
      'Help participants see that fearing God leads to action, not paralysis.',
      'Subject: The difference between terror and reverent awe.'
    ],
    '8ee3c2c3-2840-491f-81b7-abcd32f2f0f2' -- Noah
  );

  -- Lesson 1: Solomon - The Beginning of Wisdom
  INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    1,
    'The Beginning of Wisdom',
    'Solomon, the wisest man who ever lived, declared that the fear of the Lord is where all true wisdom begins. This lesson explores how reverence for God shapes our understanding of life, relationships, and eternity.',
    ARRAY['Proverbs 1:7', 'Proverbs 9:10', 'Ecclesiastes 12:13-14', '1 Kings 3:5-14'],
    ARRAY[
      'Share from personal experience how seeking wisdom apart from God led to emptiness.',
      'Explain that all of Proverbs flows from this foundational truth.',
      'Discuss how worldly wisdom differs from godly wisdom.',
      'Subject: Why reverence for God is the foundation of all understanding.'
    ],
    '73e7ef52-6406-4530-80cd-9fdf0df1a8fd' -- Solomon
  );

  -- Lesson 2: Moses - Standing on Holy Ground
  INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    2,
    'Standing on Holy Ground',
    'At the burning bush, Moses encountered the holiness of God and learned to approach Him with reverent fear. This lesson teaches how recognizing God''s holiness transforms how we worship, pray, and live.',
    ARRAY['Exodus 3:1-6', 'Exodus 20:18-21', 'Hebrews 12:28-29', 'Isaiah 6:1-5'],
    ARRAY[
      'Describe the moment of removing sandals before the holy God.',
      'Explain how Israel trembled at Sinai — and why that was appropriate.',
      'Help participants understand that God''s holiness demands our reverence.',
      'Subject: Encountering God''s holiness and responding appropriately.'
    ],
    '91318979-c775-4455-a962-aa1138def4a6' -- Moses
  );

  -- Lesson 3: Job - Fearing God in Suffering
  INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    3,
    'Fearing God in Suffering',
    'Job was described as a man who feared God and shunned evil — yet he suffered tremendously. This lesson explores how the fear of the Lord sustains us through trials and deepens our trust in God''s sovereignty.',
    ARRAY['Job 1:1-8', 'Job 28:28', 'Job 42:1-6', 'James 5:11'],
    ARRAY[
      'Share how maintaining reverence for God through suffering was tested.',
      'Discuss how encountering God''s majesty transformed perspective on suffering.',
      'Explain that fearing God means trusting Him even when we don''t understand.',
      'Subject: Maintaining holy fear through life''s darkest valleys.'
    ],
    'f743473b-ee16-4a5f-9873-cf80a432aad5' -- Job
  );

  -- Lesson 4: Isaiah - Woe Is Me
  INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    4,
    'Undone Before the Holy One',
    'When Isaiah saw the Lord high and lifted up, his immediate response was to recognize his own sinfulness. This lesson shows how true fear of the Lord produces humility, confession, and transformation.',
    ARRAY['Isaiah 6:1-8', 'Isaiah 8:13', 'Isaiah 66:2', 'Psalm 111:10'],
    ARRAY[
      'Describe the overwhelming vision of God''s throne room.',
      'Explain why seeing God''s holiness immediately revealed personal uncleanness.',
      'Show how fear of the Lord leads to cleansing and commissioning.',
      'Subject: How encountering God''s holiness transforms us.'
    ],
    '0046acc9-14a5-40cf-8ba6-1a2cd355813b' -- Isaiah
  );

  -- Lesson 5: Peter - The Fear That Leads to Obedience
  INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    5,
    'The Fear That Leads to Obedience',
    'Peter experienced moments of holy fear — from the miraculous catch of fish to walking on water. This lesson explores how reverent fear motivates obedience and deepens our relationship with Christ.',
    ARRAY['Luke 5:4-8', '1 Peter 1:17-19', '1 Peter 2:17', 'Acts 5:1-11'],
    ARRAY[
      'Share the moment of falling at Jesus'' knees, saying "Depart from me, for I am a sinful man."',
      'Explain how the early church walked in the fear of the Lord and grew.',
      'Discuss how we live as strangers here in reverent fear.',
      'Subject: How holy fear produces faithful obedience.'
    ],
    '431cf2b1-428b-4f64-bab3-1f58d13f850e' -- Peter
  );

  -- Lesson 6: James - Faith That Trembles
  INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    6,
    'Faith That Trembles and Acts',
    'James teaches that even demons believe and tremble — but true fear of God produces action. This lesson distinguishes between intellectual belief and transformative faith that fears God and keeps His commands.',
    ARRAY['James 2:19', 'James 4:7-10', 'Philippians 2:12-13', 'Hebrews 10:31'],
    ARRAY[
      'Explain why trembling alone is not enough — obedience must follow.',
      'Discuss what it means to work out salvation with fear and trembling.',
      'Help participants examine whether their fear of God produces fruit.',
      'Subject: The difference between fearful belief and faithful obedience.'
    ],
    '15d45112-a677-4950-877e-ceb932d292a5' -- James (Brother of Jesus)
  );

  -- Lesson 7: Matthew - Fear Not, Yet Fear God
  INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    7,
    'Fear Not, Yet Fear God',
    'Jesus told His disciples not to fear those who kill the body, but to fear Him who has power over both body and soul. This lesson examines Christ''s teaching on the proper object of our fear and how it liberates us from all other fears.',
    ARRAY['Matthew 10:28-31', 'Matthew 28:1-10', 'Luke 12:4-7', 'Revelation 14:7'],
    ARRAY[
      'Record Jesus'' teaching on who we should and shouldn''t fear.',
      'Explain how fearing God properly eliminates fear of man.',
      'Show how the fear of the Lord brings freedom, not bondage.',
      'Subject: Jesus'' teaching on the liberating power of fearing God alone.'
    ],
    'c2a5acb2-f2f4-4f9a-bd48-36e7349d9245' -- Matthew
  );

  -- Lesson 8: David - Worship in Reverent Awe
  INSERT INTO bible_study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    8,
    'Worship in Reverent Awe',
    'David was a man after God''s own heart who understood both intimate friendship with God and trembling reverence before Him. This final lesson explores how the fear of the Lord enhances rather than hinders our worship and intimacy with God.',
    ARRAY['Psalm 2:11', 'Psalm 33:8', 'Psalm 34:9-14', 'Psalm 112:1', '2 Samuel 6:1-15'],
    ARRAY[
      'Share experiences of both intimate worship and holy reverence.',
      'Explain how Uzzah''s death taught the importance of approaching God His way.',
      'Show that fearing God leads to blessing, provision, and protection.',
      'Discuss how reverent fear and joyful worship go together.',
      'Subject: How holy fear deepens worship and intimacy with God.',
      'Closing Reflection: The fear of the Lord is not the end of relationship with God — it is the beginning. When we truly see who He is, we cannot help but bow in awe. And in that holy moment, we discover that the God we fear is also the God who loves us beyond measure.',
      'Prayer: Holy Father, teach me to fear You rightly — not with terror, but with reverent awe. Open my eyes to see Your majesty, Your holiness, and Your power. May the fear of the Lord guard my steps, guide my decisions, and deepen my worship. Let me walk before You all my days with a heart that trembles at Your Word and rejoices in Your presence. Amen.'
    ],
    '24206039-82ca-4cbe-ac0a-a4734be7d7a8' -- David
  );

  RAISE NOTICE 'Created study "The Fear of the Lord — Walking in Holy Reverence" with ID: %', study_id;
END $$;

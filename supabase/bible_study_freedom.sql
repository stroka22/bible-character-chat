-- Bible Study: Freedom — Choosing God Over Addiction
-- Created: 2026-01-30

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
    'Freedom — Choosing God Over Addiction',
    'To guide people away from destructive coping mechanisms (like drugs, alcohol, or self-medication) and toward genuine peace, joy, and transformation through a relationship with God.',
    'Finding Real Peace and Purpose Beyond Substances and Struggles',
    '25fcf8c1-0c12-41df-ba8e-40b12e3bbb88', -- Prodigal Son (intro character)
    'Approach this study with compassion, restoration, and hope — full of grace and truth, meeting people where they are but leading them to lasting change. Focus on replacing temporary escape with eternal healing through faith, community, and the renewing power of the Holy Spirit. Theme Scripture: "It is for freedom that Christ has set us free." — Galatians 5:1',
    'public',
    false,
    'introduction'
  )
  RETURNING id INTO study_id;

  -- Introduction Module
  INSERT INTO study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    0,
    'Searching for Comfort in the Wrong Places',
    'Life''s pain drives many to seek comfort in substances, distractions, or pleasure. This introduction helps participants see that those paths never heal — they only hide. True comfort comes from God, not escape.',
    ARRAY['Jeremiah 2:13', 'Matthew 11:28–30', 'Psalm 34:18'],
    ARRAY[
      'Approach this session with compassion and honesty.',
      'Invite participants to reflect on what they turn to when life hurts — and what those choices have cost them.',
      'Subject: The futility of false comfort and God''s invitation to rest in Him.'
    ],
    '25fcf8c1-0c12-41df-ba8e-40b12e3bbb88' -- Prodigal Son
  );

  -- Lesson 1: Broken Cisterns
  INSERT INTO study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    1,
    'Broken Cisterns — Why the World''s Comforts Don''t Satisfy',
    'Drugs, alcohol, or pleasure promise escape — but they leave deeper emptiness. This lesson uncovers why only God can fill the heart''s deepest needs.',
    ARRAY['John 4:13–14', 'Isaiah 55:1–2', 'Jeremiah 2:13'],
    ARRAY[
      'Encourage transparency.',
      'Ask participants to share what ''temporary wells'' they''ve drawn from — and what they learned from them.',
      'Subject: Understanding why worldly substitutes can''t heal spiritual hunger.'
    ],
    'e9669db3-ddd2-471c-9ebc-d29b5fc66353' -- Girl at the Well (Samaritan Woman)
  );

  -- Lesson 2: The Power of Surrender
  INSERT INTO study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    2,
    'The Power of Surrender',
    'Freedom begins when we stop fighting in our own strength and surrender to God''s power. This study teaches that weakness is the doorway to victory.',
    ARRAY['2 Corinthians 12:9–10', 'Romans 6:6–14', 'James 4:7–8'],
    ARRAY[
      'Encourage confession and prayer.',
      'Surrender is not failure — it''s faith in action.',
      'Subject: Finding strength through surrender.'
    ],
    'a0156499-572d-4f13-968c-26e410a0f61c' -- Paul
  );

  -- Lesson 3: The Renewed Mind
  INSERT INTO study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    3,
    'The Renewed Mind — Replacing Lies with Truth',
    'Addiction thrives in deception — the mind believes lies that God''s truth must break. This lesson focuses on replacing false beliefs with Scripture and renewing thought patterns.',
    ARRAY['Romans 12:2', '2 Corinthians 10:4–5', 'Philippians 4:8–9'],
    ARRAY[
      'Teach participants how to take every thought captive.',
      'Encourage memorizing verses that counter lies like ''I''ll never change'' or ''I''m too far gone.''',
      'Subject: The role of truth in transformation.'
    ],
    '24206039-82ca-4cbe-ac0a-a4734be7d7a8' -- King David
  );

  -- Lesson 4: Walking in Freedom
  INSERT INTO study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    4,
    'Walking in Freedom — Staying Clean, Sober, and Spirit-Filled',
    'True recovery isn''t just quitting bad habits — it''s walking daily in the Spirit, finding purpose, and staying connected to God and community.',
    ARRAY['Galatians 5:16–25', 'John 8:31–36', '1 Corinthians 10:13'],
    ARRAY[
      'Discuss practical steps — accountability, prayer, worship, serving others — as ways to remain grounded.',
      'Subject: Living free by depending on the Holy Spirit.'
    ],
    '1711a4a6-9324-4d36-a9e4-bd7c0c37330d' -- Mary Magdalene
  );

  -- Lesson 5: The God Who Restores
  INSERT INTO study_lessons (study_id, order_index, title, summary, scripture_refs, prompts, character_id)
  VALUES (
    study_id,
    5,
    'The God Who Restores — Building a New Life',
    'God doesn''t just free us from addiction — He rebuilds what was broken. This final lesson focuses on restoration, purpose, and becoming a testimony of grace.',
    ARRAY['Joel 2:25–27', 'Isaiah 61:1–4', 'Philippians 1:6'],
    ARRAY[
      'Encourage participants to see themselves as living proof of God''s mercy.',
      'Healing is not just recovery — it''s resurrection.',
      'Subject: Hope, renewal, and lasting transformation.',
      'Closing Reflection: What once controlled you no longer defines you. God''s love is stronger than any addiction, and His Spirit brings freedom that lasts forever.',
      'Prayer: Lord, You are my freedom and my peace. Break every chain that keeps me bound, and fill my heart with Your Spirit. Teach me to turn to You first in every trial and to live the rest of my days walking in Your strength. Amen.'
    ],
    '431cf2b1-428b-4f64-bab3-1f58d13f850e' -- Peter
  );

  RAISE NOTICE 'Created study "Freedom — Choosing God Over Addiction" with ID: %', study_id;
END $$;

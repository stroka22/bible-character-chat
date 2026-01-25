-- Seed Reading Plans
-- Date: 2026-01-24

-- 1. Gospels in 30 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'gospels-30-days',
  'Gospels in 30 Days',
  'Read through all four Gospels - Matthew, Mark, Luke, and John - in just 30 days. Experience the life, teachings, death, and resurrection of Jesus.',
  30,
  'gospel',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- 2. Psalms & Proverbs - 31 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'psalms-proverbs-31',
  'Psalms & Proverbs in 31 Days',
  'A month of wisdom and worship. Read through Proverbs and selected Psalms to grow in wisdom and deepen your praise.',
  31,
  'wisdom',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- 3. New Testament in 90 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'new-testament-90',
  'New Testament in 90 Days',
  'Journey through the entire New Testament in three months. From the Gospels to Revelation.',
  90,
  'testament',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- 4. Bible in a Year
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'bible-in-a-year',
  'Bible in a Year',
  'Read through the entire Bible in one year with daily Old Testament, New Testament, Psalms, and Proverbs readings.',
  365,
  'complete',
  'intensive',
  true
) ON CONFLICT (slug) DO NOTHING;

-- 5. Romans Deep Dive - 14 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'romans-deep-dive',
  'Romans Deep Dive',
  'Two weeks exploring Paul''s masterful letter to the Romans. Understand salvation, grace, and living by faith.',
  14,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 6. Genesis to Revelation Overview - 60 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'bible-overview-60',
  'Bible Overview in 60 Days',
  'Get the big picture of the Bible in two months by reading key chapters from Genesis to Revelation.',
  60,
  'overview',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 7. Acts of the Apostles - 14 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'acts-14-days',
  'Acts of the Apostles in 14 Days',
  'Follow the early church from Pentecost to Paul''s journey to Rome. See how the gospel spread across the ancient world.',
  14,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 8. Genesis - 21 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'genesis-21-days',
  'Genesis in 21 Days',
  'Explore the book of beginnings - creation, the fall, the flood, and the patriarchs Abraham, Isaac, Jacob, and Joseph.',
  21,
  'book',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- 9. Sermon on the Mount - 7 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'sermon-on-mount-7',
  'Sermon on the Mount in 7 Days',
  'A week-long deep dive into Jesus'' most famous teaching in Matthew 5-7. Transform your understanding of kingdom living.',
  7,
  'topical',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- 10. Epistles Overview - 30 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'epistles-30-days',
  'New Testament Letters in 30 Days',
  'Read through all the epistles from Romans to Jude. Discover practical wisdom for Christian living from the apostles.',
  30,
  'testament',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 11. Prophets Highlights - 21 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'prophets-21-days',
  'Prophets Highlights in 21 Days',
  'Key passages from Isaiah, Jeremiah, Ezekiel, Daniel and the minor prophets. Discover God''s heart for justice and redemption.',
  21,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 12. Life of David - 14 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'life-of-david-14',
  'Life of David in 14 Days',
  'From shepherd boy to king. Follow David''s journey through 1 & 2 Samuel, including his triumphs, failures, and heart for God.',
  14,
  'character',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 13. Easter Journey - 7 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'easter-journey-7',
  'Easter Journey in 7 Days',
  'Walk with Jesus through His final week - from the triumphal entry to the resurrection. Perfect for Easter preparation.',
  7,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 14. Christmas Story - 7 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'christmas-story-7',
  'Christmas Story in 7 Days',
  'Experience the nativity through the prophecies and Gospel accounts. Prepare your heart for celebrating Jesus'' birth.',
  7,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 15. Women of the Bible - 14 Days
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'women-of-bible-14',
  'Women of the Bible in 14 Days',
  'Meet Ruth, Esther, Mary, and other remarkable women whose faith shaped history. Stories of courage, faith, and devotion.',
  14,
  'character',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Now seed the daily readings for each plan

-- GOSPELS IN 30 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'gospels-30-days';
  IF plan_uuid IS NOT NULL THEN
    -- Matthew (Days 1-10)
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'The Birth & Early Life of Jesus', '[{"book":"Matthew","chapter":1},{"book":"Matthew","chapter":2}]', 'How does Jesus'' genealogy show God''s faithfulness across generations?'),
    (plan_uuid, 2, 'John the Baptist & Jesus'' Baptism', '[{"book":"Matthew","chapter":3},{"book":"Matthew","chapter":4}]', 'What can we learn from Jesus'' response to temptation?'),
    (plan_uuid, 3, 'The Sermon on the Mount (Part 1)', '[{"book":"Matthew","chapter":5},{"book":"Matthew","chapter":6}]', 'Which beatitude speaks most to your life right now?'),
    (plan_uuid, 4, 'The Sermon on the Mount (Part 2)', '[{"book":"Matthew","chapter":7},{"book":"Matthew","chapter":8}]', 'What does it mean to build your life on the rock?'),
    (plan_uuid, 5, 'Miracles & Calling', '[{"book":"Matthew","chapter":9},{"book":"Matthew","chapter":10}]', 'How did Jesus demonstrate compassion through His miracles?'),
    (plan_uuid, 6, 'Teaching & Opposition', '[{"book":"Matthew","chapter":11},{"book":"Matthew","chapter":12},{"book":"Matthew","chapter":13}]', 'Why did Jesus teach in parables?'),
    (plan_uuid, 7, 'Miracles & Peter''s Confession', '[{"book":"Matthew","chapter":14},{"book":"Matthew","chapter":15},{"book":"Matthew","chapter":16}]', 'What does Peter''s confession mean for your faith?'),
    (plan_uuid, 8, 'Transfiguration & Teaching', '[{"book":"Matthew","chapter":17},{"book":"Matthew","chapter":18},{"book":"Matthew","chapter":19}]', 'How should we handle conflict in the church?'),
    (plan_uuid, 9, 'Final Journey to Jerusalem', '[{"book":"Matthew","chapter":20},{"book":"Matthew","chapter":21},{"book":"Matthew","chapter":22}]', 'What does servant leadership look like?'),
    (plan_uuid, 10, 'End Times & Parables', '[{"book":"Matthew","chapter":23},{"book":"Matthew","chapter":24},{"book":"Matthew","chapter":25}]', 'How can we be ready for Christ''s return?'),
    -- Mark (Days 11-16)
    (plan_uuid, 11, 'The Beginning of Jesus'' Ministry', '[{"book":"Mark","chapter":1},{"book":"Mark","chapter":2},{"book":"Mark","chapter":3}]', 'Why does Mark emphasize Jesus'' authority?'),
    (plan_uuid, 12, 'Parables & Miracles', '[{"book":"Mark","chapter":4},{"book":"Mark","chapter":5},{"book":"Mark","chapter":6}]', 'What storms in your life need Jesus'' peace?'),
    (plan_uuid, 13, 'Traditions & True Discipleship', '[{"book":"Mark","chapter":7},{"book":"Mark","chapter":8},{"book":"Mark","chapter":9}]', 'What does it mean to take up your cross?'),
    (plan_uuid, 14, 'Teaching on Divorce, Wealth & Service', '[{"book":"Mark","chapter":10},{"book":"Mark","chapter":11},{"book":"Mark","chapter":12}]', 'How does Jesus redefine greatness?'),
    (plan_uuid, 15, 'The Olivet Discourse', '[{"book":"Mark","chapter":13},{"book":"Mark","chapter":14}]', 'How can we stay watchful and faithful?'),
    (plan_uuid, 16, 'The Crucifixion & Resurrection', '[{"book":"Mark","chapter":15},{"book":"Mark","chapter":16}]', 'What does the resurrection mean for your daily life?'),
    -- Luke (Days 17-24)
    (plan_uuid, 17, 'Birth Narratives', '[{"book":"Luke","chapter":1},{"book":"Luke","chapter":2}]', 'How do Mary''s and Zechariah''s songs inspire worship?'),
    (plan_uuid, 18, 'Preparation & Early Ministry', '[{"book":"Luke","chapter":3},{"book":"Luke","chapter":4},{"book":"Luke","chapter":5}]', 'What was Jesus'' mission statement in Nazareth?'),
    (plan_uuid, 19, 'Teachings & Healings', '[{"book":"Luke","chapter":6},{"book":"Luke","chapter":7},{"book":"Luke","chapter":8}]', 'How does Jesus show compassion to outsiders?'),
    (plan_uuid, 20, 'Mission & Discipleship', '[{"book":"Luke","chapter":9},{"book":"Luke","chapter":10},{"book":"Luke","chapter":11}]', 'What can we learn from the Good Samaritan?'),
    (plan_uuid, 21, 'Warnings & Parables', '[{"book":"Luke","chapter":12},{"book":"Luke","chapter":13},{"book":"Luke","chapter":14}]', 'What does it cost to follow Jesus?'),
    (plan_uuid, 22, 'Lost & Found', '[{"book":"Luke","chapter":15},{"book":"Luke","chapter":16},{"book":"Luke","chapter":17}]', 'Which "lost" parable speaks to you most?'),
    (plan_uuid, 23, 'Prayer, Humility & Salvation', '[{"book":"Luke","chapter":18},{"book":"Luke","chapter":19},{"book":"Luke","chapter":20}]', 'What does Zacchaeus teach us about transformation?'),
    (plan_uuid, 24, 'Final Days in Jerusalem', '[{"book":"Luke","chapter":21},{"book":"Luke","chapter":22},{"book":"Luke","chapter":23},{"book":"Luke","chapter":24}]', 'What stands out about Jesus'' final words?'),
    -- John (Days 25-30)
    (plan_uuid, 25, 'The Word Made Flesh', '[{"book":"John","chapter":1},{"book":"John","chapter":2},{"book":"John","chapter":3}]', 'What does it mean that Jesus is the Word?'),
    (plan_uuid, 26, 'Living Water & Bread of Life', '[{"book":"John","chapter":4},{"book":"John","chapter":5},{"book":"John","chapter":6}]', 'How does Jesus satisfy our deepest needs?'),
    (plan_uuid, 27, 'Light of the World', '[{"book":"John","chapter":7},{"book":"John","chapter":8},{"book":"John","chapter":9}]', 'What areas of your life need Jesus'' light?'),
    (plan_uuid, 28, 'The Good Shepherd', '[{"book":"John","chapter":10},{"book":"John","chapter":11},{"book":"John","chapter":12}]', 'How does Jesus care for you as His sheep?'),
    (plan_uuid, 29, 'The Upper Room', '[{"book":"John","chapter":13},{"book":"John","chapter":14},{"book":"John","chapter":15},{"book":"John","chapter":16},{"book":"John","chapter":17}]', 'What comfort do you find in Jesus'' farewell discourse?'),
    (plan_uuid, 30, 'Death & Resurrection', '[{"book":"John","chapter":18},{"book":"John","chapter":19},{"book":"John","chapter":20},{"book":"John","chapter":21}]', 'How does John''s account of the resurrection strengthen your faith?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- PSALMS & PROVERBS 31 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'psalms-proverbs-31';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'The Two Paths', '[{"book":"Psalms","chapter":1},{"book":"Proverbs","chapter":1}]', 'What path are you walking today?'),
    (plan_uuid, 2, 'Trust in the Lord', '[{"book":"Psalms","chapter":2},{"book":"Psalms","chapter":3},{"book":"Proverbs","chapter":2}]', 'How can you pursue wisdom more intentionally?'),
    (plan_uuid, 3, 'Morning & Evening Prayer', '[{"book":"Psalms","chapter":4},{"book":"Psalms","chapter":5},{"book":"Proverbs","chapter":3}]', 'What does trusting God with all your heart look like?'),
    (plan_uuid, 4, 'God''s Majesty', '[{"book":"Psalms","chapter":8},{"book":"Psalms","chapter":19},{"book":"Proverbs","chapter":4}]', 'How does creation reveal God''s glory?'),
    (plan_uuid, 5, 'The Lord is My Shepherd', '[{"book":"Psalms","chapter":23},{"book":"Proverbs","chapter":5}]', 'In what ways has God been your shepherd?'),
    (plan_uuid, 6, 'Worship & Reverence', '[{"book":"Psalms","chapter":24},{"book":"Psalms","chapter":29},{"book":"Proverbs","chapter":6}]', 'What does it mean to have clean hands and a pure heart?'),
    (plan_uuid, 7, 'Confession & Forgiveness', '[{"book":"Psalms","chapter":32},{"book":"Psalms","chapter":51},{"book":"Proverbs","chapter":7}]', 'Is there sin you need to confess today?'),
    (plan_uuid, 8, 'Delight in God', '[{"book":"Psalms","chapter":34},{"book":"Psalms","chapter":37},{"book":"Proverbs","chapter":8}]', 'How can you delight yourself in the Lord?'),
    (plan_uuid, 9, 'Longing for God', '[{"book":"Psalms","chapter":42},{"book":"Psalms","chapter":43},{"book":"Proverbs","chapter":9}]', 'When have you felt spiritually thirsty?'),
    (plan_uuid, 10, 'God Our Refuge', '[{"book":"Psalms","chapter":46},{"book":"Psalms","chapter":91},{"book":"Proverbs","chapter":10}]', 'How is God your refuge in trouble?'),
    (plan_uuid, 11, 'Praise & Thanksgiving', '[{"book":"Psalms","chapter":100},{"book":"Psalms","chapter":103},{"book":"Proverbs","chapter":11}]', 'List 5 things you''re thankful for today.'),
    (plan_uuid, 12, 'God''s Word', '[{"book":"Psalms","chapter":119,"verses":"1-48"},{"book":"Proverbs","chapter":12}]', 'How can God''s Word guide your steps today?'),
    (plan_uuid, 13, 'God''s Word (cont.)', '[{"book":"Psalms","chapter":119,"verses":"49-96"},{"book":"Proverbs","chapter":13}]', 'What verse can you meditate on this week?'),
    (plan_uuid, 14, 'God''s Word (cont.)', '[{"book":"Psalms","chapter":119,"verses":"97-144"},{"book":"Proverbs","chapter":14}]', 'How is God''s Word a lamp to your feet?'),
    (plan_uuid, 15, 'God''s Word (cont.)', '[{"book":"Psalms","chapter":119,"verses":"145-176"},{"book":"Proverbs","chapter":15}]', 'What promises from Psalm 119 encourage you?'),
    (plan_uuid, 16, 'Songs of Ascent', '[{"book":"Psalms","chapter":120},{"book":"Psalms","chapter":121},{"book":"Psalms","chapter":122},{"book":"Proverbs","chapter":16}]', 'Where does your help come from?'),
    (plan_uuid, 17, 'Songs of Ascent (cont.)', '[{"book":"Psalms","chapter":123},{"book":"Psalms","chapter":124},{"book":"Psalms","chapter":125},{"book":"Proverbs","chapter":17}]', 'How has the Lord been on your side?'),
    (plan_uuid, 18, 'Songs of Ascent (cont.)', '[{"book":"Psalms","chapter":126},{"book":"Psalms","chapter":127},{"book":"Psalms","chapter":128},{"book":"Proverbs","chapter":18}]', 'What does building with the Lord look like?'),
    (plan_uuid, 19, 'Songs of Ascent (cont.)', '[{"book":"Psalms","chapter":129},{"book":"Psalms","chapter":130},{"book":"Psalms","chapter":131},{"book":"Proverbs","chapter":19}]', 'What does waiting on the Lord look like for you?'),
    (plan_uuid, 20, 'Songs of Ascent (cont.)', '[{"book":"Psalms","chapter":132},{"book":"Psalms","chapter":133},{"book":"Psalms","chapter":134},{"book":"Proverbs","chapter":20}]', 'How do you experience unity with other believers?'),
    (plan_uuid, 21, 'Thanksgiving', '[{"book":"Psalms","chapter":136},{"book":"Psalms","chapter":138},{"book":"Proverbs","chapter":21}]', 'God''s love endures forever - what does this mean to you?'),
    (plan_uuid, 22, 'God Knows Me', '[{"book":"Psalms","chapter":139},{"book":"Proverbs","chapter":22}]', 'How does it feel to be fully known by God?'),
    (plan_uuid, 23, 'Daily Dependence', '[{"book":"Psalms","chapter":140},{"book":"Psalms","chapter":141},{"book":"Proverbs","chapter":23}]', 'What do you need God''s help with today?'),
    (plan_uuid, 24, 'Praise & Deliverance', '[{"book":"Psalms","chapter":142},{"book":"Psalms","chapter":143},{"book":"Proverbs","chapter":24}]', 'When have you cried out to God in desperation?'),
    (plan_uuid, 25, 'God''s Greatness', '[{"book":"Psalms","chapter":144},{"book":"Psalms","chapter":145},{"book":"Proverbs","chapter":25}]', 'How is God great in your eyes?'),
    (plan_uuid, 26, 'Hallelujah Psalms', '[{"book":"Psalms","chapter":146},{"book":"Psalms","chapter":147},{"book":"Proverbs","chapter":26}]', 'What moves you to praise God?'),
    (plan_uuid, 27, 'Universal Praise', '[{"book":"Psalms","chapter":148},{"book":"Psalms","chapter":149},{"book":"Proverbs","chapter":27}]', 'How can all creation praise God?'),
    (plan_uuid, 28, 'Final Praise', '[{"book":"Psalms","chapter":150},{"book":"Proverbs","chapter":28}]', 'Let everything that has breath praise the Lord!'),
    (plan_uuid, 29, 'Words of Agur', '[{"book":"Proverbs","chapter":29},{"book":"Proverbs","chapter":30}]', 'What wisdom from Agur stands out to you?'),
    (plan_uuid, 30, 'The Noble Wife', '[{"book":"Proverbs","chapter":31}]', 'What qualities of a godly person do you aspire to?'),
    (plan_uuid, 31, 'Review & Reflection', '[{"book":"Psalms","chapter":1},{"book":"Psalms","chapter":150}]', 'How has this month changed your view of wisdom and worship?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- ROMANS DEEP DIVE - 14 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'romans-deep-dive';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Introduction & Gospel Power', '[{"book":"Romans","chapter":1}]', 'Why is Paul not ashamed of the gospel?'),
    (plan_uuid, 2, 'God''s Righteous Judgment', '[{"book":"Romans","chapter":2}]', 'What does this chapter teach about judging others?'),
    (plan_uuid, 3, 'No One is Righteous', '[{"book":"Romans","chapter":3}]', 'How does understanding our sinfulness lead to gratitude?'),
    (plan_uuid, 4, 'Abraham''s Faith', '[{"book":"Romans","chapter":4}]', 'What can we learn from Abraham''s example of faith?'),
    (plan_uuid, 5, 'Peace with God', '[{"book":"Romans","chapter":5}]', 'How does suffering produce hope?'),
    (plan_uuid, 6, 'Dead to Sin, Alive in Christ', '[{"book":"Romans","chapter":6}]', 'What does it mean to be a slave to righteousness?'),
    (plan_uuid, 7, 'The Struggle with Sin', '[{"book":"Romans","chapter":7}]', 'How do you relate to Paul''s internal struggle?'),
    (plan_uuid, 8, 'Life in the Spirit', '[{"book":"Romans","chapter":8}]', 'What does "no condemnation" mean for your daily life?'),
    (plan_uuid, 9, 'God''s Sovereign Choice', '[{"book":"Romans","chapter":9}]', 'How does God''s sovereignty comfort you?'),
    (plan_uuid, 10, 'Salvation for All', '[{"book":"Romans","chapter":10}]', 'Who can you share the gospel with this week?'),
    (plan_uuid, 11, 'Israel''s Future', '[{"book":"Romans","chapter":11}]', 'What does this teach about God''s faithfulness?'),
    (plan_uuid, 12, 'Living Sacrifices', '[{"book":"Romans","chapter":12}]', 'How can you be transformed by renewing your mind?'),
    (plan_uuid, 13, 'Submission & Love', '[{"book":"Romans","chapter":13},{"book":"Romans","chapter":14}]', 'How should Christians relate to authorities?'),
    (plan_uuid, 14, 'Unity & Benediction', '[{"book":"Romans","chapter":15},{"book":"Romans","chapter":16}]', 'What has Romans taught you about the gospel?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- ACTS 14 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'acts-14-days';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Ascension & Pentecost', '[{"book":"Acts","chapter":1},{"book":"Acts","chapter":2}]', 'What difference did the Holy Spirit make for the disciples?'),
    (plan_uuid, 2, 'The Early Church', '[{"book":"Acts","chapter":3},{"book":"Acts","chapter":4}]', 'What characterized the early church community?'),
    (plan_uuid, 3, 'Persecution & Growth', '[{"book":"Acts","chapter":5},{"book":"Acts","chapter":6}]', 'How did the church respond to opposition?'),
    (plan_uuid, 4, 'Stephen''s Martyrdom', '[{"book":"Acts","chapter":7}]', 'What can we learn from Stephen''s faith and courage?'),
    (plan_uuid, 5, 'The Gospel Spreads', '[{"book":"Acts","chapter":8},{"book":"Acts","chapter":9}]', 'How did Saul''s conversion change everything?'),
    (plan_uuid, 6, 'Gentiles Included', '[{"book":"Acts","chapter":10},{"book":"Acts","chapter":11}]', 'What does Peter''s vision teach about God''s heart?'),
    (plan_uuid, 7, 'The Church at Antioch', '[{"book":"Acts","chapter":12},{"book":"Acts","chapter":13}]', 'How did the church discern God''s leading?'),
    (plan_uuid, 8, 'First Missionary Journey', '[{"book":"Acts","chapter":14},{"book":"Acts","chapter":15}]', 'What was the Jerusalem Council''s decision about Gentiles?'),
    (plan_uuid, 9, 'Second Journey Begins', '[{"book":"Acts","chapter":16},{"book":"Acts","chapter":17}]', 'How did Paul adapt his message to different audiences?'),
    (plan_uuid, 10, 'Corinth & Ephesus', '[{"book":"Acts","chapter":18},{"book":"Acts","chapter":19}]', 'What impact did the gospel have in these cities?'),
    (plan_uuid, 11, 'Farewell to Ephesus', '[{"book":"Acts","chapter":20}]', 'What was Paul''s charge to the Ephesian elders?'),
    (plan_uuid, 12, 'Arrest in Jerusalem', '[{"book":"Acts","chapter":21},{"book":"Acts","chapter":22}]', 'How did Paul respond to threats on his life?'),
    (plan_uuid, 13, 'Trials & Testimony', '[{"book":"Acts","chapter":23},{"book":"Acts","chapter":24},{"book":"Acts","chapter":25}]', 'How did Paul use his trials to share the gospel?'),
    (plan_uuid, 14, 'Journey to Rome', '[{"book":"Acts","chapter":26},{"book":"Acts","chapter":27},{"book":"Acts","chapter":28}]', 'How does Acts end, and what does it mean for us?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- SERMON ON THE MOUNT - 7 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'sermon-on-mount-7';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'The Beatitudes', '[{"book":"Matthew","chapter":5,"verses":"1-16"}]', 'Which beatitude challenges you the most?'),
    (plan_uuid, 2, 'Fulfilling the Law', '[{"book":"Matthew","chapter":5,"verses":"17-48"}]', 'How does Jesus raise the standard beyond external behavior?'),
    (plan_uuid, 3, 'Secret Righteousness', '[{"book":"Matthew","chapter":6,"verses":"1-18"}]', 'What does it mean to practice righteousness in secret?'),
    (plan_uuid, 4, 'Treasures & Worry', '[{"book":"Matthew","chapter":6,"verses":"19-34"}]', 'Where is your treasure, and what does that reveal about your heart?'),
    (plan_uuid, 5, 'Judging & Asking', '[{"book":"Matthew","chapter":7,"verses":"1-12"}]', 'How do the commands about judging and asking relate to each other?'),
    (plan_uuid, 6, 'Two Gates, Two Trees', '[{"book":"Matthew","chapter":7,"verses":"13-23"}]', 'What distinguishes true disciples from false prophets?'),
    (plan_uuid, 7, 'The Wise Builder', '[{"book":"Matthew","chapter":7,"verses":"24-29"}]', 'What does it mean to build your life on the rock?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- GENESIS 21 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'genesis-21-days';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Creation', '[{"book":"Genesis","chapter":1},{"book":"Genesis","chapter":2}]', 'What does being made in God''s image mean to you?'),
    (plan_uuid, 2, 'The Fall', '[{"book":"Genesis","chapter":3}]', 'How do you see the effects of the fall in the world today?'),
    (plan_uuid, 3, 'Cain, Abel & Seth', '[{"book":"Genesis","chapter":4},{"book":"Genesis","chapter":5}]', 'What does Cain''s story teach about sin and its consequences?'),
    (plan_uuid, 4, 'Noah & the Flood', '[{"book":"Genesis","chapter":6},{"book":"Genesis","chapter":7}]', 'What characterized Noah''s faith?'),
    (plan_uuid, 5, 'New Beginning & Covenant', '[{"book":"Genesis","chapter":8},{"book":"Genesis","chapter":9}]', 'What does the rainbow covenant tell us about God?'),
    (plan_uuid, 6, 'Tower of Babel', '[{"book":"Genesis","chapter":10},{"book":"Genesis","chapter":11}]', 'What was wrong with the builders'' motivation?'),
    (plan_uuid, 7, 'Call of Abram', '[{"book":"Genesis","chapter":12},{"book":"Genesis","chapter":13}]', 'What did it cost Abram to follow God''s call?'),
    (plan_uuid, 8, 'Abram & Lot', '[{"book":"Genesis","chapter":14},{"book":"Genesis","chapter":15}]', 'How did God reassure Abram about His promises?'),
    (plan_uuid, 9, 'Hagar & Ishmael', '[{"book":"Genesis","chapter":16},{"book":"Genesis","chapter":17}]', 'What happens when we try to help God fulfill His promises?'),
    (plan_uuid, 10, 'Sodom & Gomorrah', '[{"book":"Genesis","chapter":18},{"book":"Genesis","chapter":19}]', 'What does Abraham''s intercession teach us about prayer?'),
    (plan_uuid, 11, 'Isaac Born', '[{"book":"Genesis","chapter":20},{"book":"Genesis","chapter":21}]', 'How did Sarah respond to God''s faithfulness?'),
    (plan_uuid, 12, 'The Test', '[{"book":"Genesis","chapter":22}]', 'What does this story foreshadow about Jesus?'),
    (plan_uuid, 13, 'A Bride for Isaac', '[{"book":"Genesis","chapter":23},{"book":"Genesis","chapter":24}]', 'How did the servant show faith in his mission?'),
    (plan_uuid, 14, 'Jacob & Esau', '[{"book":"Genesis","chapter":25},{"book":"Genesis","chapter":26},{"book":"Genesis","chapter":27}]', 'What can we learn from this family''s dysfunction?'),
    (plan_uuid, 15, 'Jacob''s Ladder', '[{"book":"Genesis","chapter":28},{"book":"Genesis","chapter":29}]', 'How did God meet Jacob in his lowest moment?'),
    (plan_uuid, 16, 'Jacob''s Wives & Children', '[{"book":"Genesis","chapter":30},{"book":"Genesis","chapter":31}]', 'How did God bless Jacob despite his scheming?'),
    (plan_uuid, 17, 'Wrestling with God', '[{"book":"Genesis","chapter":32},{"book":"Genesis","chapter":33}]', 'What changed in Jacob after Peniel?'),
    (plan_uuid, 18, 'Joseph''s Dreams', '[{"book":"Genesis","chapter":37}]', 'How do Joseph''s brothers respond to his dreams?'),
    (plan_uuid, 19, 'Joseph in Egypt', '[{"book":"Genesis","chapter":39},{"book":"Genesis","chapter":40},{"book":"Genesis","chapter":41}]', 'How did Joseph respond to injustice and temptation?'),
    (plan_uuid, 20, 'Brothers Reunited', '[{"book":"Genesis","chapter":42},{"book":"Genesis","chapter":43},{"book":"Genesis","chapter":44},{"book":"Genesis","chapter":45}]', 'How did Joseph show grace to his brothers?'),
    (plan_uuid, 21, 'Blessing & Legacy', '[{"book":"Genesis","chapter":46},{"book":"Genesis","chapter":47},{"book":"Genesis","chapter":48},{"book":"Genesis","chapter":49},{"book":"Genesis","chapter":50}]', 'What did Joseph mean by "God meant it for good"?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- EASTER JOURNEY - 7 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'easter-journey-7';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Triumphal Entry (Palm Sunday)', '[{"book":"Matthew","chapter":21,"verses":"1-17"},{"book":"John","chapter":12,"verses":"12-19"}]', 'Why did Jesus weep over Jerusalem?'),
    (plan_uuid, 2, 'Teaching in the Temple', '[{"book":"Matthew","chapter":21,"verses":"18-46"},{"book":"Matthew","chapter":22}]', 'What was Jesus'' message to the religious leaders?'),
    (plan_uuid, 3, 'Olivet Discourse', '[{"book":"Matthew","chapter":24},{"book":"Matthew","chapter":25}]', 'How should we live in light of Jesus'' return?'),
    (plan_uuid, 4, 'The Last Supper', '[{"book":"John","chapter":13},{"book":"John","chapter":14}]', 'What did Jesus want His disciples to remember?'),
    (plan_uuid, 5, 'Gethsemane & Arrest', '[{"book":"Matthew","chapter":26},{"book":"John","chapter":18}]', 'What do we learn from Jesus'' prayer in the garden?'),
    (plan_uuid, 6, 'Trial & Crucifixion (Good Friday)', '[{"book":"Matthew","chapter":27},{"book":"John","chapter":19}]', 'What do Jesus'' words from the cross reveal?'),
    (plan_uuid, 7, 'Resurrection (Easter)', '[{"book":"Matthew","chapter":28},{"book":"John","chapter":20}]', 'How does the resurrection change everything?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- CHRISTMAS STORY - 7 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'christmas-story-7';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'The Prophecies', '[{"book":"Isaiah","chapter":7,"verses":"14"},{"book":"Isaiah","chapter":9,"verses":"1-7"},{"book":"Micah","chapter":5,"verses":"2-5"}]', 'How do these prophecies point to Jesus?'),
    (plan_uuid, 2, 'Gabriel''s Announcements', '[{"book":"Luke","chapter":1,"verses":"1-56"}]', 'How did Mary respond to the angel''s message?'),
    (plan_uuid, 3, 'John''s Birth', '[{"book":"Luke","chapter":1,"verses":"57-80"}]', 'What was John''s purpose according to Zechariah?'),
    (plan_uuid, 4, 'Joseph''s Dream', '[{"book":"Matthew","chapter":1}]', 'What do the names Jesus and Emmanuel mean?'),
    (plan_uuid, 5, 'The Birth of Jesus', '[{"book":"Luke","chapter":2,"verses":"1-20"}]', 'Why did God announce Jesus'' birth to shepherds?'),
    (plan_uuid, 6, 'The Wise Men', '[{"book":"Matthew","chapter":2}]', 'What do the gifts of the wise men symbolize?'),
    (plan_uuid, 7, 'The Word Made Flesh', '[{"book":"John","chapter":1,"verses":"1-18"}]', 'What does it mean that the Word became flesh and dwelt among us?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- WOMEN OF THE BIBLE - 14 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'women-of-bible-14';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Eve: Mother of All Living', '[{"book":"Genesis","chapter":2,"verses":"18-25"},{"book":"Genesis","chapter":3}]', 'What was Eve''s role in creation and the fall?'),
    (plan_uuid, 2, 'Sarah: Mother of Nations', '[{"book":"Genesis","chapter":18,"verses":"1-15"},{"book":"Genesis","chapter":21,"verses":"1-7"}]', 'How did Sarah''s faith grow over time?'),
    (plan_uuid, 3, 'Rebekah: The Chosen Bride', '[{"book":"Genesis","chapter":24}]', 'What qualities made Rebekah stand out?'),
    (plan_uuid, 4, 'Miriam: Prophetess & Leader', '[{"book":"Exodus","chapter":2,"verses":"1-10"},{"book":"Exodus","chapter":15,"verses":"19-21"}]', 'How did Miriam use her gifts for God?'),
    (plan_uuid, 5, 'Rahab: Faith & Courage', '[{"book":"Joshua","chapter":2},{"book":"Joshua","chapter":6,"verses":"22-25"}]', 'What can we learn from Rahab''s faith?'),
    (plan_uuid, 6, 'Deborah: Judge & Warrior', '[{"book":"Judges","chapter":4},{"book":"Judges","chapter":5}]', 'How did Deborah lead Israel?'),
    (plan_uuid, 7, 'Ruth: Loyalty & Love', '[{"book":"Ruth","chapter":1},{"book":"Ruth","chapter":2}]', 'What does Ruth''s commitment teach about faithfulness?'),
    (plan_uuid, 8, 'Ruth: Redemption', '[{"book":"Ruth","chapter":3},{"book":"Ruth","chapter":4}]', 'How does Ruth''s story point to Jesus?'),
    (plan_uuid, 9, 'Hannah: Prayer & Dedication', '[{"book":"1 Samuel","chapter":1},{"book":"1 Samuel","chapter":2,"verses":"1-11"}]', 'What can we learn from Hannah''s prayer?'),
    (plan_uuid, 10, 'Esther: For Such a Time', '[{"book":"Esther","chapter":4},{"book":"Esther","chapter":5}]', 'How did Esther show courage?'),
    (plan_uuid, 11, 'Esther: Victory', '[{"book":"Esther","chapter":7},{"book":"Esther","chapter":8}]', 'What does Esther''s story teach about God''s providence?'),
    (plan_uuid, 12, 'Mary: Chosen & Blessed', '[{"book":"Luke","chapter":1,"verses":"26-56"}]', 'How did Mary respond to God''s call?'),
    (plan_uuid, 13, 'Mary Magdalene: Witness', '[{"book":"John","chapter":20,"verses":"1-18"}]', 'Why was Mary the first to see the risen Lord?'),
    (plan_uuid, 14, 'Priscilla & Other Leaders', '[{"book":"Acts","chapter":18,"verses":"1-4, 24-28"},{"book":"Romans","chapter":16,"verses":"1-16"}]', 'How did women serve in the early church?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- LIFE OF DAVID - 14 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'life-of-david-14';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Anointed as King', '[{"book":"1 Samuel","chapter":16}]', 'What did God see in David that others missed?'),
    (plan_uuid, 2, 'David & Goliath', '[{"book":"1 Samuel","chapter":17}]', 'What gave David confidence to face the giant?'),
    (plan_uuid, 3, 'Friendship with Jonathan', '[{"book":"1 Samuel","chapter":18},{"book":"1 Samuel","chapter":19}]', 'What made David and Jonathan''s friendship special?'),
    (plan_uuid, 4, 'Fleeing from Saul', '[{"book":"1 Samuel","chapter":20},{"book":"1 Samuel","chapter":21},{"book":"1 Samuel","chapter":22}]', 'How did David handle being pursued?'),
    (plan_uuid, 5, 'Sparing Saul', '[{"book":"1 Samuel","chapter":24},{"book":"1 Samuel","chapter":26}]', 'Why did David refuse to kill Saul?'),
    (plan_uuid, 6, 'David & Abigail', '[{"book":"1 Samuel","chapter":25}]', 'How did Abigail show wisdom?'),
    (plan_uuid, 7, 'King of Judah', '[{"book":"2 Samuel","chapter":1},{"book":"2 Samuel","chapter":2}]', 'How did David honor Saul in death?'),
    (plan_uuid, 8, 'King of All Israel', '[{"book":"2 Samuel","chapter":5},{"book":"2 Samuel","chapter":6}]', 'How did David worship when the ark came to Jerusalem?'),
    (plan_uuid, 9, 'God''s Covenant with David', '[{"book":"2 Samuel","chapter":7}]', 'What did God promise David about his dynasty?'),
    (plan_uuid, 10, 'David''s Sin', '[{"book":"2 Samuel","chapter":11},{"book":"2 Samuel","chapter":12}]', 'What led to David''s downfall?'),
    (plan_uuid, 11, 'Consequences & Repentance', '[{"book":"Psalms","chapter":51}]', 'What does true repentance look like?'),
    (plan_uuid, 12, 'Absalom''s Rebellion', '[{"book":"2 Samuel","chapter":15},{"book":"2 Samuel","chapter":16}]', 'How did David respond to his son''s betrayal?'),
    (plan_uuid, 13, 'Absalom''s Death', '[{"book":"2 Samuel","chapter":18}]', 'What does David''s grief reveal about his heart?'),
    (plan_uuid, 14, 'David''s Last Words', '[{"book":"2 Samuel","chapter":23,"verses":"1-7"},{"book":"1 Kings","chapter":2,"verses":"1-12"}]', 'What legacy did David leave behind?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

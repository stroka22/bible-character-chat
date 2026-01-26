-- More Reading Plans - Expanded Catalog
-- Date: 2026-01-25

-- ============================================
-- TOPICAL PLANS
-- ============================================

-- Faith & Trust
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'faith-and-trust-21',
  'Building Faith & Trust in 21 Days',
  'Explore what it means to trust God through stories of faithful men and women. From Abraham to the early church.',
  21,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Prayer
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'prayer-14-days',
  'Learning to Pray in 14 Days',
  'Discover the power of prayer through Jesus'' teaching, the Psalms, and examples from Scripture.',
  14,
  'topical',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Wisdom
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'wisdom-for-life-30',
  'Wisdom for Life in 30 Days',
  'Gain practical wisdom from Proverbs, Ecclesiastes, and James. Apply ancient wisdom to modern challenges.',
  30,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Love
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'gods-love-14',
  'Discovering God''s Love in 14 Days',
  'Experience the depth of God''s love through Scripture. From creation to the cross and beyond.',
  14,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Forgiveness
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'forgiveness-10-days',
  'Freedom Through Forgiveness in 10 Days',
  'Learn what the Bible teaches about giving and receiving forgiveness. Find freedom and healing.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Anxiety & Peace
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'peace-over-anxiety-14',
  'Peace Over Anxiety in 14 Days',
  'Find God''s peace in anxious times. Scriptures to calm your heart and renew your mind.',
  14,
  'topical',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Hope
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'hope-in-hard-times-10',
  'Hope in Hard Times in 10 Days',
  'When life is difficult, Scripture offers hope. Stories and promises to sustain you through trials.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Spiritual Growth
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'spiritual-growth-30',
  'Spiritual Growth in 30 Days',
  'A month-long journey through passages on discipleship, spiritual disciplines, and becoming more like Christ.',
  30,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Identity in Christ
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'identity-in-christ-14',
  'Your Identity in Christ in 14 Days',
  'Discover who you are in Christ. Scriptures that reveal your value, purpose, and calling.',
  14,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Holy Spirit
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'holy-spirit-14',
  'The Holy Spirit in 14 Days',
  'Understand the person and work of the Holy Spirit. From Genesis to Acts and the epistles.',
  14,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- BOOK STUDIES
-- ============================================

-- Exodus
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'exodus-21-days',
  'Exodus in 21 Days',
  'From slavery to freedom. Follow Israel''s journey out of Egypt and God''s covenant at Sinai.',
  21,
  'book',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Psalms (selection)
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'psalms-favorites-30',
  '30 Favorite Psalms',
  'A month of the most beloved Psalms. Worship, lament, thanksgiving, and praise.',
  30,
  'book',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Isaiah Highlights
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'isaiah-21-days',
  'Isaiah Highlights in 21 Days',
  'Key passages from Isaiah including messianic prophecies, comfort, and hope for God''s people.',
  21,
  'book',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Jeremiah
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'jeremiah-21-days',
  'Jeremiah in 21 Days',
  'The weeping prophet''s message of judgment and hope. God''s faithfulness even in exile.',
  21,
  'book',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Daniel
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'daniel-14-days',
  'Daniel in 14 Days',
  'Faith under fire. Daniel''s courage in Babylon and his prophetic visions of God''s kingdom.',
  14,
  'book',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Mark
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'mark-14-days',
  'Mark in 14 Days',
  'The fast-paced Gospel. See Jesus as the suffering servant who came to give His life.',
  14,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Luke
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'luke-21-days',
  'Luke in 21 Days',
  'The Gospel for everyone. Jesus'' compassion for the poor, outcast, and marginalized.',
  21,
  'book',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- John
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'john-21-days',
  'John in 21 Days',
  'The spiritual Gospel. Discover Jesus as the Word, the Light, the Way, the Truth, and the Life.',
  21,
  'book',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- 1 Corinthians
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  '1-corinthians-14-days',
  '1 Corinthians in 14 Days',
  'Paul''s letter to a divided church. Unity, love, spiritual gifts, and the resurrection.',
  14,
  'book',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Galatians
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'galatians-7-days',
  'Galatians in 7 Days',
  'The letter of freedom. Justification by faith and life in the Spirit.',
  7,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Ephesians
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'ephesians-7-days',
  'Ephesians in 7 Days',
  'Our riches in Christ. Identity, unity, and spiritual warfare.',
  7,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Philippians
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'philippians-7-days',
  'Philippians in 7 Days',
  'Joy in all circumstances. Paul''s letter of encouragement from prison.',
  7,
  'book',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Colossians
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'colossians-5-days',
  'Colossians in 5 Days',
  'The supremacy of Christ. He is before all things and in Him all things hold together.',
  5,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- James
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'james-7-days',
  'James in 7 Days',
  'Faith that works. Practical wisdom for everyday Christian living.',
  7,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 1 Peter
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  '1-peter-7-days',
  '1 Peter in 7 Days',
  'Hope in suffering. Living as strangers in this world with an eternal perspective.',
  7,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 1 John
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  '1-john-7-days',
  '1 John in 7 Days',
  'Walking in the light. Love, truth, and assurance of salvation.',
  7,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Revelation
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'revelation-21-days',
  'Revelation in 21 Days',
  'The final victory. Jesus'' message to the churches and the ultimate triumph of God.',
  21,
  'book',
  'intensive',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Hebrews
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'hebrews-14-days',
  'Hebrews in 14 Days',
  'Jesus is better. The supremacy of Christ over angels, Moses, and the old covenant.',
  14,
  'book',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CHARACTER STUDIES
-- ============================================

-- Moses
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'life-of-moses-21',
  'Life of Moses in 21 Days',
  'From the Nile to Mount Nebo. Follow Moses'' journey from prince to shepherd to deliverer.',
  21,
  'character',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Abraham
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'life-of-abraham-14',
  'Life of Abraham in 14 Days',
  'The father of faith. Abraham''s journey of trust, failure, and God''s unbreakable promises.',
  14,
  'character',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Joseph
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'life-of-joseph-14',
  'Life of Joseph in 14 Days',
  'From pit to palace. Joseph''s story of betrayal, perseverance, and divine providence.',
  14,
  'character',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Elijah & Elisha
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'elijah-elisha-14',
  'Elijah & Elisha in 14 Days',
  'Two powerful prophets. Miracles, confrontation with evil, and passing the mantle.',
  14,
  'character',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Peter
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'life-of-peter-14',
  'Life of Peter in 14 Days',
  'From fisherman to rock. Peter''s failures, restoration, and leadership in the early church.',
  14,
  'character',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Paul
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'life-of-paul-21',
  'Life of Paul in 21 Days',
  'From persecutor to apostle. Paul''s conversion, missionary journeys, and letters.',
  21,
  'character',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Jesus'' Miracles
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'miracles-of-jesus-21',
  'Miracles of Jesus in 21 Days',
  'Healing, deliverance, and power over nature. See Jesus'' authority and compassion.',
  21,
  'character',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Parables of Jesus
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'parables-of-jesus-21',
  'Parables of Jesus in 21 Days',
  'Kingdom stories. Discover deeper truths through Jesus'' masterful teaching method.',
  21,
  'character',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEASONAL PLANS
-- ============================================

-- Advent
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'advent-25-days',
  'Advent Journey in 25 Days',
  'Prepare your heart for Christmas. Prophecies, promises, and the coming of the Messiah.',
  25,
  'seasonal',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Lent
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'lent-40-days',
  'Lenten Journey in 40 Days',
  'Walk with Jesus from temptation to triumph. A season of reflection and renewal.',
  40,
  'seasonal',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- New Year
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'new-year-fresh-start-7',
  'New Year Fresh Start in 7 Days',
  'Begin the year with purpose. Scriptures on renewal, hope, and God''s faithfulness.',
  7,
  'seasonal',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- LIFE SITUATIONS
-- ============================================

-- Marriage
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'marriage-14-days',
  'Building a Godly Marriage in 14 Days',
  'God''s design for marriage. Love, commitment, and growing together in faith.',
  14,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Parenting
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'parenting-14-days',
  'Godly Parenting in 14 Days',
  'Raising children in faith. Wisdom from Scripture for the journey of parenthood.',
  14,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Work & Calling
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'work-and-calling-10',
  'Work & Calling in 10 Days',
  'Find purpose in your work. Scripture on vocation, integrity, and serving God in the workplace.',
  10,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Grief & Loss
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'grief-and-comfort-14',
  'Comfort in Grief in 14 Days',
  'God''s presence in loss. Psalms and scriptures that bring comfort in sorrow.',
  14,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Financial Wisdom
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'financial-wisdom-10',
  'Financial Wisdom in 10 Days',
  'Biblical principles for stewardship. Generosity, contentment, and trusting God with your resources.',
  10,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Leadership
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'biblical-leadership-14',
  'Biblical Leadership in 14 Days',
  'Lead like Jesus. Servant leadership, integrity, and wisdom from Scripture.',
  14,
  'life',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FOUNDATIONAL / BEGINNER PLANS
-- ============================================

-- Basics of Faith
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'basics-of-faith-14',
  'Basics of Faith in 14 Days',
  'New to the Bible? Start here. Core teachings about God, Jesus, salvation, and Christian living.',
  14,
  'foundational',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Key Bible Stories
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'key-bible-stories-30',
  'Key Bible Stories in 30 Days',
  'The essential stories everyone should know. From creation to the early church.',
  30,
  'foundational',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Ten Commandments
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'ten-commandments-10',
  'Ten Commandments in 10 Days',
  'One commandment per day. Understand God''s moral law and its relevance today.',
  10,
  'foundational',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Lord''s Prayer
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'lords-prayer-7',
  'The Lord''s Prayer in 7 Days',
  'Unpack the prayer Jesus taught. One phrase per day with related scriptures.',
  7,
  'foundational',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Beatitudes
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'beatitudes-9-days',
  'The Beatitudes in 9 Days',
  'Eight blessings plus introduction. Deep dive into Jesus'' vision for kingdom living.',
  9,
  'foundational',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Fruit of the Spirit
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'fruit-of-spirit-9',
  'Fruit of the Spirit in 9 Days',
  'Love, joy, peace, and more. How the Spirit transforms our character.',
  9,
  'foundational',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Armor of God
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'armor-of-god-7',
  'Armor of God in 7 Days',
  'Stand firm in spiritual battle. Each piece of armor and how to put it on.',
  7,
  'foundational',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Names of God
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'names-of-god-14',
  'Names of God in 14 Days',
  'Know God by His names. Jehovah, El Shaddai, and more - each reveals His character.',
  14,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Names of Jesus
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'names-of-jesus-14',
  'Names of Jesus in 14 Days',
  'Who is Jesus? Explore His titles: Lamb of God, Good Shepherd, Prince of Peace, and more.',
  14,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Now add daily readings for key plans
-- ============================================

-- PRAYER 14 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'prayer-14-days';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Jesus Teaches Us to Pray', '[{"book":"Matthew","chapter":6,"verses":"5-15"}]', 'What stands out to you about how Jesus says we should pray?'),
    (plan_uuid, 2, 'Persistence in Prayer', '[{"book":"Luke","chapter":11,"verses":"1-13"},{"book":"Luke","chapter":18,"verses":"1-8"}]', 'Why does Jesus emphasize persistence in prayer?'),
    (plan_uuid, 3, 'David''s Prayers', '[{"book":"Psalms","chapter":5},{"book":"Psalms","chapter":17}]', 'What can we learn from how David approached God?'),
    (plan_uuid, 4, 'Prayers of Confession', '[{"book":"Psalms","chapter":32},{"book":"Psalms","chapter":51}]', 'Why is confession an important part of prayer?'),
    (plan_uuid, 5, 'Prayers of Thanksgiving', '[{"book":"Psalms","chapter":100},{"book":"Psalms","chapter":103}]', 'What are you thankful for today?'),
    (plan_uuid, 6, 'Prayers in Trouble', '[{"book":"Psalms","chapter":46},{"book":"Psalms","chapter":91}]', 'How do these psalms encourage you to pray when in trouble?'),
    (plan_uuid, 7, 'Hannah''s Prayer', '[{"book":"1 Samuel","chapter":1,"verses":"1-20"},{"book":"1 Samuel","chapter":2,"verses":"1-11"}]', 'What can we learn from Hannah''s persistence and praise?'),
    (plan_uuid, 8, 'Solomon''s Prayer', '[{"book":"1 Kings","chapter":3,"verses":"1-15"},{"book":"1 Kings","chapter":8,"verses":"22-53"}]', 'What did Solomon ask for, and why did God bless him?'),
    (plan_uuid, 9, 'Nehemiah''s Prayer', '[{"book":"Nehemiah","chapter":1}]', 'How did Nehemiah combine prayer with action?'),
    (plan_uuid, 10, 'Daniel''s Prayer Life', '[{"book":"Daniel","chapter":6,"verses":"1-23"},{"book":"Daniel","chapter":9,"verses":"1-19"}]', 'What made Daniel''s prayer life so powerful?'),
    (plan_uuid, 11, 'Jesus'' Prayer Life', '[{"book":"Mark","chapter":1,"verses":"35"},{"book":"Luke","chapter":5,"verses":"16"},{"book":"Luke","chapter":6,"verses":"12"}]', 'How did Jesus prioritize prayer?'),
    (plan_uuid, 12, 'Gethsemane', '[{"book":"Matthew","chapter":26,"verses":"36-46"}]', 'What does Jesus'' prayer in the garden teach us about surrendering to God?'),
    (plan_uuid, 13, 'The Early Church Prays', '[{"book":"Acts","chapter":1,"verses":"12-14"},{"book":"Acts","chapter":2,"verses":"42-47"},{"book":"Acts","chapter":4,"verses":"23-31"}]', 'How central was prayer in the early church?'),
    (plan_uuid, 14, 'Instructions on Prayer', '[{"book":"Philippians","chapter":4,"verses":"6-7"},{"book":"1 Thessalonians","chapter":5,"verses":"16-18"},{"book":"James","chapter":5,"verses":"13-18"}]', 'What practical instructions does the New Testament give about prayer?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- PEACE OVER ANXIETY 14 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'peace-over-anxiety-14';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Cast Your Cares', '[{"book":"1 Peter","chapter":5,"verses":"6-7"},{"book":"Psalms","chapter":55,"verses":"22"}]', 'What burdens do you need to cast on God today?'),
    (plan_uuid, 2, 'Do Not Fear', '[{"book":"Isaiah","chapter":41,"verses":"10-13"},{"book":"Isaiah","chapter":43,"verses":"1-5"}]', 'How does knowing God is with you change your perspective on fear?'),
    (plan_uuid, 3, 'The Lord is My Shepherd', '[{"book":"Psalms","chapter":23}]', 'Which verse in this psalm brings you the most comfort?'),
    (plan_uuid, 4, 'Peace I Leave With You', '[{"book":"John","chapter":14,"verses":"25-31"},{"book":"John","chapter":16,"verses":"33"}]', 'What kind of peace does Jesus offer?'),
    (plan_uuid, 5, 'Be Anxious for Nothing', '[{"book":"Philippians","chapter":4,"verses":"4-9"}]', 'What is the antidote to anxiety according to Paul?'),
    (plan_uuid, 6, 'God is Our Refuge', '[{"book":"Psalms","chapter":46}]', 'What does it mean that God is our refuge and strength?'),
    (plan_uuid, 7, 'Trust in the Lord', '[{"book":"Proverbs","chapter":3,"verses":"5-8"},{"book":"Isaiah","chapter":26,"verses":"3-4"}]', 'What does it look like to trust God with all your heart?'),
    (plan_uuid, 8, 'Jesus Calms the Storm', '[{"book":"Mark","chapter":4,"verses":"35-41"},{"book":"Matthew","chapter":14,"verses":"22-33"}]', 'What storms in your life need Jesus'' peace?'),
    (plan_uuid, 9, 'Rest for the Weary', '[{"book":"Matthew","chapter":11,"verses":"28-30"}]', 'What does Jesus'' rest look like in your life?'),
    (plan_uuid, 10, 'God''s Promises', '[{"book":"Romans","chapter":8,"verses":"28-39"}]', 'How does knowing God works all things for good bring peace?'),
    (plan_uuid, 11, 'The Peace of God', '[{"book":"Colossians","chapter":3,"verses":"15-17"},{"book":"2 Thessalonians","chapter":3,"verses":"16"}]', 'How can you let the peace of Christ rule in your heart?'),
    (plan_uuid, 12, 'When Afraid', '[{"book":"Psalms","chapter":56"},{"book":"Psalms","chapter":27,"verses":"1-5"}]', 'What helped David overcome his fears?'),
    (plan_uuid, 13, 'God''s Faithful Care', '[{"book":"Matthew","chapter":6,"verses":"25-34"}]', 'Why does Jesus tell us not to worry about tomorrow?'),
    (plan_uuid, 14, 'Strength and Peace', '[{"book":"Isaiah","chapter":40,"verses":"28-31"},{"book":"Psalms","chapter":29,"verses":"11"}]', 'How can you rely on God''s strength today?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- PHILIPPIANS 7 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'philippians-7-days';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Thanksgiving & Prayer', '[{"book":"Philippians","chapter":1,"verses":"1-11"}]', 'What strikes you about Paul''s prayer for the Philippians?'),
    (plan_uuid, 2, 'To Live is Christ', '[{"book":"Philippians","chapter":1,"verses":"12-30"}]', 'What does "to live is Christ" mean to you?'),
    (plan_uuid, 3, 'The Mind of Christ', '[{"book":"Philippians","chapter":2,"verses":"1-11"}]', 'How does Jesus'' humility challenge you?'),
    (plan_uuid, 4, 'Shining as Lights', '[{"book":"Philippians","chapter":2,"verses":"12-30"}]', 'How can you shine as a light in your world?'),
    (plan_uuid, 5, 'Knowing Christ', '[{"book":"Philippians","chapter":3,"verses":"1-11"}]', 'What would you give up to know Christ more?'),
    (plan_uuid, 6, 'Pressing On', '[{"book":"Philippians","chapter":3,"verses":"12-21"}]', 'What does pressing toward the goal look like in your life?'),
    (plan_uuid, 7, 'Rejoice in the Lord', '[{"book":"Philippians","chapter":4}]', 'What is the secret of contentment Paul discovered?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- JOHN 21 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'john-21-days';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'The Word Became Flesh', '[{"book":"John","chapter":1,"verses":"1-18"}]', 'What does it mean that Jesus is the Word?'),
    (plan_uuid, 2, 'First Disciples & First Sign', '[{"book":"John","chapter":1,"verses":"19-51"},{"book":"John","chapter":2}]', 'How did the first disciples respond to Jesus?'),
    (plan_uuid, 3, 'You Must Be Born Again', '[{"book":"John","chapter":3}]', 'What does being born again mean to you?'),
    (plan_uuid, 4, 'Living Water', '[{"book":"John","chapter":4}]', 'How does Jesus satisfy our deepest thirst?'),
    (plan_uuid, 5, 'The Son Gives Life', '[{"book":"John","chapter":5}]', 'What authority does Jesus claim in this chapter?'),
    (plan_uuid, 6, 'Bread of Life', '[{"book":"John","chapter":6}]', 'What does it mean to feed on Jesus?'),
    (plan_uuid, 7, 'Rivers of Living Water', '[{"book":"John","chapter":7}]', 'How does the Spirit flow from believers?'),
    (plan_uuid, 8, 'Light of the World', '[{"book":"John","chapter":8}]', 'What does Jesus'' light expose in our lives?'),
    (plan_uuid, 9, 'The Man Born Blind', '[{"book":"John","chapter":9}]', 'What kind of blindness does Jesus heal?'),
    (plan_uuid, 10, 'The Good Shepherd', '[{"book":"John","chapter":10}]', 'How is Jesus a good shepherd to you?'),
    (plan_uuid, 11, 'The Resurrection and the Life', '[{"book":"John","chapter":11}]', 'How does the raising of Lazarus strengthen your faith?'),
    (plan_uuid, 12, 'The Triumphal Entry', '[{"book":"John","chapter":12}]', 'Why did Jesus come to Jerusalem knowing He would die?'),
    (plan_uuid, 13, 'Jesus Washes Feet', '[{"book":"John","chapter":13}]', 'How does Jesus'' example of service challenge you?'),
    (plan_uuid, 14, 'The Way, Truth, and Life', '[{"book":"John","chapter":14}]', 'What comfort do you find in Jesus'' farewell words?'),
    (plan_uuid, 15, 'The True Vine', '[{"book":"John","chapter":15}]', 'What does it mean to abide in Christ?'),
    (plan_uuid, 16, 'The Spirit''s Work', '[{"book":"John","chapter":16}]', 'How does the Holy Spirit help us?'),
    (plan_uuid, 17, 'Jesus'' High Priestly Prayer', '[{"book":"John","chapter":17}]', 'What does Jesus pray for His followers?'),
    (plan_uuid, 18, 'The Arrest', '[{"book":"John","chapter":18}]', 'How does Jesus show His sovereignty even in arrest?'),
    (plan_uuid, 19, 'The Crucifixion', '[{"book":"John","chapter":19}]', 'What stands out about John''s account of the cross?'),
    (plan_uuid, 20, 'The Resurrection', '[{"book":"John","chapter":20}]', 'How did the disciples respond to the empty tomb?'),
    (plan_uuid, 21, 'Restored & Commissioned', '[{"book":"John","chapter":21}]', 'What does Jesus'' restoration of Peter teach us?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- PARABLES OF JESUS 21 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'parables-of-jesus-21';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Why Jesus Spoke in Parables', '[{"book":"Matthew","chapter":13,"verses":"10-17"},{"book":"Mark","chapter":4,"verses":"10-12"}]', 'Why did Jesus teach in parables?'),
    (plan_uuid, 2, 'The Sower', '[{"book":"Matthew","chapter":13,"verses":"1-9, 18-23"}]', 'What kind of soil is your heart?'),
    (plan_uuid, 3, 'The Wheat and Weeds', '[{"book":"Matthew","chapter":13,"verses":"24-30, 36-43"}]', 'What does this teach about judgment?'),
    (plan_uuid, 4, 'Mustard Seed & Leaven', '[{"book":"Matthew","chapter":13,"verses":"31-35"}]', 'How does God''s kingdom grow?'),
    (plan_uuid, 5, 'Hidden Treasure & Pearl', '[{"book":"Matthew","chapter":13,"verses":"44-46"}]', 'What would you give up for the kingdom?'),
    (plan_uuid, 6, 'The Unforgiving Servant', '[{"book":"Matthew","chapter":18,"verses":"21-35"}]', 'How does receiving forgiveness change how we forgive?'),
    (plan_uuid, 7, 'The Workers in the Vineyard', '[{"book":"Matthew","chapter":20,"verses":"1-16"}]', 'Is God''s grace unfair? Why or why not?'),
    (plan_uuid, 8, 'The Two Sons', '[{"book":"Matthew","chapter":21,"verses":"28-32"}]', 'Which son are you more like?'),
    (plan_uuid, 9, 'The Wedding Banquet', '[{"book":"Matthew","chapter":22,"verses":"1-14"}]', 'What does this teach about responding to God''s invitation?'),
    (plan_uuid, 10, 'The Ten Virgins', '[{"book":"Matthew","chapter":25,"verses":"1-13"}]', 'How can we be ready for Christ''s return?'),
    (plan_uuid, 11, 'The Talents', '[{"book":"Matthew","chapter":25,"verses":"14-30"}]', 'What has God entrusted to you?'),
    (plan_uuid, 12, 'The Good Samaritan', '[{"book":"Luke","chapter":10,"verses":"25-37"}]', 'Who is your neighbor?'),
    (plan_uuid, 13, 'The Rich Fool', '[{"book":"Luke","chapter":12,"verses":"13-21"}]', 'What makes someone rich toward God?'),
    (plan_uuid, 14, 'The Barren Fig Tree', '[{"book":"Luke","chapter":13,"verses":"6-9"}]', 'How patient is God with us?'),
    (plan_uuid, 15, 'The Great Banquet', '[{"book":"Luke","chapter":14,"verses":"15-24"}]', 'What excuses keep people from God?'),
    (plan_uuid, 16, 'The Lost Sheep', '[{"book":"Luke","chapter":15,"verses":"1-7"}]', 'How far will God go to find the lost?'),
    (plan_uuid, 17, 'The Lost Coin', '[{"book":"Luke","chapter":15,"verses":"8-10"}]', 'Why does heaven rejoice over one sinner?'),
    (plan_uuid, 18, 'The Prodigal Son', '[{"book":"Luke","chapter":15,"verses":"11-32"}]', 'Which character do you relate to most?'),
    (plan_uuid, 19, 'The Rich Man and Lazarus', '[{"book":"Luke","chapter":16,"verses":"19-31"}]', 'What does this teach about the afterlife?'),
    (plan_uuid, 20, 'The Persistent Widow', '[{"book":"Luke","chapter":18,"verses":"1-8"}]', 'How does this parable encourage your prayer life?'),
    (plan_uuid, 21, 'The Pharisee and Tax Collector', '[{"book":"Luke","chapter":18,"verses":"9-14"}]', 'What does true humility before God look like?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- LIFE OF PAUL 21 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'life-of-paul-21';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Saul the Persecutor', '[{"book":"Acts","chapter":7,"verses":"54-60"},{"book":"Acts","chapter":8,"verses":"1-3"}]', 'What was Saul like before his conversion?'),
    (plan_uuid, 2, 'The Damascus Road', '[{"book":"Acts","chapter":9,"verses":"1-19"}]', 'How did Jesus reveal Himself to Saul?'),
    (plan_uuid, 3, 'Early Ministry', '[{"book":"Acts","chapter":9,"verses":"20-31"}]', 'How did people respond to Saul''s conversion?'),
    (plan_uuid, 4, 'Called to the Gentiles', '[{"book":"Acts","chapter":13,"verses":"1-12"}]', 'How did the church discern Paul''s calling?'),
    (plan_uuid, 5, 'First Missionary Journey', '[{"book":"Acts","chapter":13,"verses":"13-52"}]', 'How did Paul preach to different audiences?'),
    (plan_uuid, 6, 'Persecution & Perseverance', '[{"book":"Acts","chapter":14}]', 'How did Paul respond to opposition?'),
    (plan_uuid, 7, 'The Jerusalem Council', '[{"book":"Acts","chapter":15,"verses":"1-35"}]', 'What was decided about Gentile believers?'),
    (plan_uuid, 8, 'Second Journey Begins', '[{"book":"Acts","chapter":15,"verses":"36-41"},{"book":"Acts","chapter":16,"verses":"1-15"}]', 'How did the Spirit guide Paul?'),
    (plan_uuid, 9, 'Philippi', '[{"book":"Acts","chapter":16,"verses":"16-40"}]', 'How did Paul respond to imprisonment?'),
    (plan_uuid, 10, 'Thessalonica & Berea', '[{"book":"Acts","chapter":17,"verses":"1-15"}]', 'What made the Bereans noble?'),
    (plan_uuid, 11, 'Athens', '[{"book":"Acts","chapter":17,"verses":"16-34"}]', 'How did Paul adapt his message for philosophers?'),
    (plan_uuid, 12, 'Corinth', '[{"book":"Acts","chapter":18,"verses":"1-17"}]', 'How did God encourage Paul in Corinth?'),
    (plan_uuid, 13, 'Ephesus', '[{"book":"Acts","chapter":19}]', 'What impact did the gospel have in Ephesus?'),
    (plan_uuid, 14, 'Farewell to Ephesus', '[{"book":"Acts","chapter":20,"verses":"17-38"}]', 'What was Paul''s charge to the elders?'),
    (plan_uuid, 15, 'Arrested in Jerusalem', '[{"book":"Acts","chapter":21,"verses":"17-40"}]', 'Why did Paul go to Jerusalem despite warnings?'),
    (plan_uuid, 16, 'Paul''s Defense', '[{"book":"Acts","chapter":22},{"book":"Acts","chapter":23,"verses":"1-11"}]', 'How did Paul share his testimony?'),
    (plan_uuid, 17, 'Before Felix & Festus', '[{"book":"Acts","chapter":24},{"book":"Acts","chapter":25}]', 'How did Paul use his trials for witness?'),
    (plan_uuid, 18, 'Before Agrippa', '[{"book":"Acts","chapter":26}]', 'What was Agrippa''s response to Paul?'),
    (plan_uuid, 19, 'Shipwreck', '[{"book":"Acts","chapter":27}]', 'How did Paul show leadership in crisis?'),
    (plan_uuid, 20, 'Rome at Last', '[{"book":"Acts","chapter":28}]', 'How did Paul continue ministry in Rome?'),
    (plan_uuid, 21, 'Paul''s Legacy', '[{"book":"2 Timothy","chapter":4,"verses":"6-18"}]', 'What was Paul''s perspective at the end of his life?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- BASICS OF FAITH 14 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'basics-of-faith-14';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'God the Creator', '[{"book":"Genesis","chapter":1},{"book":"Psalms","chapter":19,"verses":"1-6"}]', 'What does creation reveal about God?'),
    (plan_uuid, 2, 'Humans & Sin', '[{"book":"Genesis","chapter":3},{"book":"Romans","chapter":3,"verses":"23"},{"book":"Romans","chapter":6,"verses":"23"}]', 'How did sin enter the world and affect us?'),
    (plan_uuid, 3, 'God''s Love', '[{"book":"John","chapter":3,"verses":"16-17"},{"book":"Romans","chapter":5,"verses":"8"},{"book":"1 John","chapter":4,"verses":"9-10"}]', 'How has God shown His love for us?'),
    (plan_uuid, 4, 'Who is Jesus?', '[{"book":"John","chapter":1,"verses":"1-14"},{"book":"Colossians","chapter":1,"verses":"15-20"}]', 'What do these passages teach about Jesus?'),
    (plan_uuid, 5, 'Jesus'' Life & Ministry', '[{"book":"Luke","chapter":4,"verses":"16-21"},{"book":"Matthew","chapter":9,"verses":"35-38"}]', 'What was Jesus'' mission on earth?'),
    (plan_uuid, 6, 'The Cross', '[{"book":"Isaiah","chapter":53"},{"book":"1 Peter","chapter":2,"verses":"24"}]', 'Why did Jesus have to die?'),
    (plan_uuid, 7, 'The Resurrection', '[{"book":"1 Corinthians","chapter":15,"verses":"1-11"},{"book":"Romans","chapter":10,"verses":"9"}]', 'Why is the resurrection so important?'),
    (plan_uuid, 8, 'Salvation by Grace', '[{"book":"Ephesians","chapter":2,"verses":"1-10"}]', 'How are we saved?'),
    (plan_uuid, 9, 'New Life in Christ', '[{"book":"2 Corinthians","chapter":5,"verses":"17"},{"book":"Romans","chapter":6,"verses":"1-14"}]', 'What changes when we follow Jesus?'),
    (plan_uuid, 10, 'The Holy Spirit', '[{"book":"John","chapter":14,"verses":"15-27"},{"book":"Acts","chapter":2,"verses":"1-4"}]', 'Who is the Holy Spirit and what does He do?'),
    (plan_uuid, 11, 'The Church', '[{"book":"Acts","chapter":2,"verses":"42-47"},{"book":"1 Corinthians","chapter":12,"verses":"12-27"}]', 'Why is the church important?'),
    (plan_uuid, 12, 'Prayer', '[{"book":"Matthew","chapter":6,"verses":"5-15"},{"book":"Philippians","chapter":4,"verses":"6-7"}]', 'How should we pray?'),
    (plan_uuid, 13, 'The Bible', '[{"book":"2 Timothy","chapter":3,"verses":"16-17"},{"book":"Psalms","chapter":119,"verses":"105"}]', 'Why is Scripture important?'),
    (plan_uuid, 14, 'Living for Jesus', '[{"book":"Matthew","chapter":28,"verses":"18-20"},{"book":"Micah","chapter":6,"verses":"8"}]', 'What does it mean to follow Jesus daily?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- KEY BIBLE STORIES 30 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'key-bible-stories-30';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Creation', '[{"book":"Genesis","chapter":1},{"book":"Genesis","chapter":2,"verses":"1-3"}]', 'What does creation tell us about God?'),
    (plan_uuid, 2, 'The Fall', '[{"book":"Genesis","chapter":3}]', 'How did sin change everything?'),
    (plan_uuid, 3, 'Noah and the Flood', '[{"book":"Genesis","chapter":6,"verses":"9-22"},{"book":"Genesis","chapter":7},{"book":"Genesis","chapter":8,"verses":"1-19"}]', 'What does Noah''s story teach about faith and judgment?'),
    (plan_uuid, 4, 'Abraham''s Call', '[{"book":"Genesis","chapter":12,"verses":"1-9"},{"book":"Genesis","chapter":15}]', 'What did it cost Abraham to follow God?'),
    (plan_uuid, 5, 'Abraham & Isaac', '[{"book":"Genesis","chapter":22,"verses":"1-19"}]', 'What does this story foreshadow?'),
    (plan_uuid, 6, 'Jacob''s Story', '[{"book":"Genesis","chapter":28,"verses":"10-22"},{"book":"Genesis","chapter":32,"verses":"22-32"}]', 'How did God change Jacob?'),
    (plan_uuid, 7, 'Joseph''s Journey', '[{"book":"Genesis","chapter":37"},{"book":"Genesis","chapter":45,"verses":"1-15"}]', 'How did God use Joseph''s suffering?'),
    (plan_uuid, 8, 'Moses & the Burning Bush', '[{"book":"Exodus","chapter":3}]', 'How does God call ordinary people?'),
    (plan_uuid, 9, 'The Exodus', '[{"book":"Exodus","chapter":12,"verses":"1-14, 29-42"},{"book":"Exodus","chapter":14}]', 'What does the Exodus teach about salvation?'),
    (plan_uuid, 10, 'The Ten Commandments', '[{"book":"Exodus","chapter":20,"verses":"1-21"}]', 'Why did God give the law?'),
    (plan_uuid, 11, 'Joshua & Jericho', '[{"book":"Joshua","chapter":1,"verses":"1-9"},{"book":"Joshua","chapter":6}]', 'How did God give Israel victory?'),
    (plan_uuid, 12, 'Gideon', '[{"book":"Judges","chapter":6,"verses":"11-24"},{"book":"Judges","chapter":7,"verses":"1-22"}]', 'Why did God reduce Gideon''s army?'),
    (plan_uuid, 13, 'Ruth''s Loyalty', '[{"book":"Ruth","chapter":1"},{"book":"Ruth","chapter":4,"verses":"13-22"}]', 'How is Ruth in Jesus'' family line?'),
    (plan_uuid, 14, 'Samuel''s Call', '[{"book":"1 Samuel","chapter":3}]', 'How does God speak to us?'),
    (plan_uuid, 15, 'David & Goliath', '[{"book":"1 Samuel","chapter":17}]', 'What gave David courage?'),
    (plan_uuid, 16, 'Solomon''s Wisdom', '[{"book":"1 Kings","chapter":3,"verses":"1-15"}]', 'What should we ask God for?'),
    (plan_uuid, 17, 'Elijah on Carmel', '[{"book":"1 Kings","chapter":18,"verses":"20-40"}]', 'How did God prove Himself?'),
    (plan_uuid, 18, 'Jonah', '[{"book":"Jonah","chapter":1"},{"book":"Jonah","chapter":2"},{"book":"Jonah","chapter":3"}]', 'What does Jonah teach about God''s mercy?'),
    (plan_uuid, 19, 'Daniel in the Lions'' Den', '[{"book":"Daniel","chapter":6}]', 'How did Daniel''s faith stand the test?'),
    (plan_uuid, 20, 'Esther Saves Her People', '[{"book":"Esther","chapter":4"},{"book":"Esther","chapter":7"}]', 'How did God work behind the scenes?'),
    (plan_uuid, 21, 'Jesus'' Birth', '[{"book":"Luke","chapter":2,"verses":"1-20"}]', 'Why did Jesus come as a baby?'),
    (plan_uuid, 22, 'Jesus'' Baptism & Temptation', '[{"book":"Matthew","chapter":3,"verses":"13-17"},{"book":"Matthew","chapter":4,"verses":"1-11"}]', 'How did Jesus overcome temptation?'),
    (plan_uuid, 23, 'Jesus Calls Disciples', '[{"book":"Luke","chapter":5,"verses":"1-11"},{"book":"Mark","chapter":3,"verses":"13-19"}]', 'What does it mean to follow Jesus?'),
    (plan_uuid, 24, 'Jesus Feeds 5000', '[{"book":"John","chapter":6,"verses":"1-15"}]', 'What does this miracle reveal?'),
    (plan_uuid, 25, 'The Transfiguration', '[{"book":"Matthew","chapter":17,"verses":"1-13"}]', 'What did the disciples see?'),
    (plan_uuid, 26, 'The Last Supper', '[{"book":"Luke","chapter":22,"verses":"7-23"}]', 'Why do we remember this meal?'),
    (plan_uuid, 27, 'The Crucifixion', '[{"book":"Luke","chapter":23,"verses":"26-49"}]', 'Why did Jesus die?'),
    (plan_uuid, 28, 'The Resurrection', '[{"book":"Luke","chapter":24,"verses":"1-12"}]', 'How does the resurrection change everything?'),
    (plan_uuid, 29, 'Pentecost', '[{"book":"Acts","chapter":2,"verses":"1-41"}]', 'How did the church begin?'),
    (plan_uuid, 30, 'Paul''s Conversion', '[{"book":"Acts","chapter":9,"verses":"1-22"}]', 'How can God change anyone?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- FRUIT OF THE SPIRIT 9 DAYS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'fruit-of-spirit-9';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Introduction: Walking by the Spirit', '[{"book":"Galatians","chapter":5,"verses":"16-26"}]', 'What does it mean to walk by the Spirit?'),
    (plan_uuid, 2, 'Love', '[{"book":"1 Corinthians","chapter":13"},{"book":"1 John","chapter":4,"verses":"7-12"}]', 'How is godly love different from the world''s love?'),
    (plan_uuid, 3, 'Joy', '[{"book":"Nehemiah","chapter":8,"verses":"10"},{"book":"Philippians","chapter":4,"verses":"4-7"},{"book":"James","chapter":1,"verses":"2-4"}]', 'How can we have joy even in trials?'),
    (plan_uuid, 4, 'Peace', '[{"book":"John","chapter":14,"verses":"27"},{"book":"Philippians","chapter":4,"verses":"6-9"},{"book":"Colossians","chapter":3,"verses":"15"}]', 'What is the peace that Christ gives?'),
    (plan_uuid, 5, 'Patience', '[{"book":"James","chapter":5,"verses":"7-11"},{"book":"Romans","chapter":12,"verses":"12"},{"book":"Colossians","chapter":3,"verses":"12-13"}]', 'Why is patience so important?'),
    (plan_uuid, 6, 'Kindness & Goodness', '[{"book":"Ephesians","chapter":4,"verses":"32"},{"book":"Titus","chapter":3,"verses":"3-7"},{"book":"Romans","chapter":2,"verses":"4"}]', 'How does God''s kindness lead us to repentance?'),
    (plan_uuid, 7, 'Faithfulness', '[{"book":"Proverbs","chapter":3,"verses":"3-4"},{"book":"Matthew","chapter":25,"verses":"21"},{"book":"Lamentations","chapter":3,"verses":"22-23"}]', 'What does it mean to be faithful?'),
    (plan_uuid, 8, 'Gentleness', '[{"book":"Matthew","chapter":11,"verses":"28-30"},{"book":"1 Peter","chapter":3,"verses":"15"},{"book":"Philippians","chapter":4,"verses":"5"}]', 'How did Jesus model gentleness?'),
    (plan_uuid, 9, 'Self-Control', '[{"book":"Proverbs","chapter":25,"verses":"28"},{"book":"1 Corinthians","chapter":9,"verses":"24-27"},{"book":"2 Peter","chapter":1,"verses":"5-8"}]', 'Why is self-control essential for spiritual growth?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- 30 FAVORITE PSALMS
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'psalms-favorites-30';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'The Two Paths', '[{"book":"Psalms","chapter":1}]', 'What path are you walking?'),
    (plan_uuid, 2, 'Why Do the Nations Rage?', '[{"book":"Psalms","chapter":2}]', 'How is Jesus the answer?'),
    (plan_uuid, 3, 'Morning Prayer', '[{"book":"Psalms","chapter":5}]', 'How do you start your day?'),
    (plan_uuid, 4, 'How Majestic', '[{"book":"Psalms","chapter":8}]', 'What is mankind that God cares for us?'),
    (plan_uuid, 5, 'The Heavens Declare', '[{"book":"Psalms","chapter":19}]', 'What do creation and Scripture reveal?'),
    (plan_uuid, 6, 'My God, Why?', '[{"book":"Psalms","chapter":22}]', 'How does this psalm point to Jesus?'),
    (plan_uuid, 7, 'The Lord is My Shepherd', '[{"book":"Psalms","chapter":23}]', 'How is God your shepherd?'),
    (plan_uuid, 8, 'Who May Ascend?', '[{"book":"Psalms","chapter":24}]', 'Who is the King of Glory?'),
    (plan_uuid, 9, 'The Lord is My Light', '[{"book":"Psalms","chapter":27}]', 'What do you seek from God?'),
    (plan_uuid, 10, 'Blessed Forgiveness', '[{"book":"Psalms","chapter":32}]', 'What is the joy of forgiveness?'),
    (plan_uuid, 11, 'Taste and See', '[{"book":"Psalms","chapter":34}]', 'How have you tasted God''s goodness?'),
    (plan_uuid, 12, 'Delight in the Lord', '[{"book":"Psalms","chapter":37,"verses":"1-11"}]', 'What does it mean to delight in God?'),
    (plan_uuid, 13, 'As the Deer', '[{"book":"Psalms","chapter":42}]', 'How thirsty are you for God?'),
    (plan_uuid, 14, 'God is Our Refuge', '[{"book":"Psalms","chapter":46}]', 'How is God your refuge?'),
    (plan_uuid, 15, 'Create in Me', '[{"book":"Psalms","chapter":51}]', 'What does true repentance look like?'),
    (plan_uuid, 16, 'When I Am Afraid', '[{"book":"Psalms","chapter":56}]', 'How do you respond to fear?'),
    (plan_uuid, 17, 'My Soul Waits', '[{"book":"Psalms","chapter":62}]', 'Where do you find rest?'),
    (plan_uuid, 18, 'Bless the Lord', '[{"book":"Psalms","chapter":103}]', 'What benefits has God given you?'),
    (plan_uuid, 19, 'I Love the Lord', '[{"book":"Psalms","chapter":116}]', 'How has God delivered you?'),
    (plan_uuid, 20, 'This is the Day', '[{"book":"Psalms","chapter":118}]', 'How can you rejoice today?'),
    (plan_uuid, 21, 'Your Word', '[{"book":"Psalms","chapter":119,"verses":"1-32"}]', 'How precious is God''s Word to you?'),
    (plan_uuid, 22, 'I Lift My Eyes', '[{"book":"Psalms","chapter":121}]', 'Where does your help come from?'),
    (plan_uuid, 23, 'Unless the Lord Builds', '[{"book":"Psalms","chapter":127}]', 'What are you trying to build without God?'),
    (plan_uuid, 24, 'Out of the Depths', '[{"book":"Psalms","chapter":130}]', 'How do you cry out to God?'),
    (plan_uuid, 25, 'How Good and Pleasant', '[{"book":"Psalms","chapter":133}]', 'Why is unity so important?'),
    (plan_uuid, 26, 'Give Thanks', '[{"book":"Psalms","chapter":136}]', 'How enduring is God''s love?'),
    (plan_uuid, 27, 'Search Me, O God', '[{"book":"Psalms","chapter":139}]', 'How well does God know you?'),
    (plan_uuid, 28, 'I Will Exalt You', '[{"book":"Psalms","chapter":145}]', 'How great is God?'),
    (plan_uuid, 29, 'Praise the Lord', '[{"book":"Psalms","chapter":148}]', 'What should praise God?'),
    (plan_uuid, 30, 'Let Everything Praise', '[{"book":"Psalms","chapter":150}]', 'How do you praise God?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

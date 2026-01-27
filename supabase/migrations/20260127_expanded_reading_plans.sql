-- Expanded Reading Plans - Comprehensive Catalog
-- Date: 2026-01-27
-- This adds 80+ new plans across all categories, with full daily content for featured plans

-- ============================================
-- 🔥 CORE FOUNDATIONAL PLANS (Christ-centered)
-- ============================================

-- Messianic Prophecies Fulfilled (FEATURED - Full Content)
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'messianic-prophecies-fulfilled',
  'Messianic Prophecies Fulfilled',
  'See how Old Testament prophecies about the Messiah were perfectly fulfilled in Jesus Christ. Each day pairs prophecy with fulfillment.',
  21,
  'foundational',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- From Genesis to Jesus
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'genesis-to-jesus',
  'From Genesis to Jesus',
  'Trace the scarlet thread of redemption from creation to the cross. See how the entire Bible points to Christ.',
  30,
  'foundational',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- How We Got the Bible (FEATURED - Full Content)
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'how-we-got-the-bible',
  'How We Got the Bible',
  'Discover how the Bible was written, preserved, and compiled. Meet the authors and understand the canon.',
  14,
  'foundational',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- The Life of Jesus Chronological
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'life-of-jesus-chronological',
  'The Life of Jesus (Chronological)',
  'Walk through Jesus'' life from birth to ascension in chronological order, harmonizing all four Gospels.',
  30,
  'foundational',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- The Gospel in the Old Testament
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'gospel-in-old-testament',
  'The Gospel in the Old Testament',
  'Discover how the good news of salvation was revealed long before Jesus walked the earth.',
  14,
  'foundational',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Why Jesus Had to Die
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'why-jesus-had-to-die',
  'Why Jesus Had to Die',
  'Understand the necessity and meaning of the cross. From sacrifice to substitution to salvation.',
  10,
  'foundational',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Resurrection Power
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'resurrection-power',
  'Resurrection Power',
  'Explore what Jesus'' resurrection means for you today. Victory over death and new life in Christ.',
  7,
  'foundational',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- The Teachings of Jesus
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'teachings-of-jesus',
  'The Teachings of Jesus',
  'Dive deep into what Jesus taught about God, life, relationships, and eternity.',
  21,
  'foundational',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 📖 OLD TESTAMENT–FOCUSED PLANS
-- ============================================

-- Creation, Fall, and Promise
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'creation-fall-promise',
  'Creation, Fall, and Promise',
  'The foundational story of humanity. How it all began, what went wrong, and God''s plan to make it right.',
  10,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Joshua: Conquering Fear
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'joshua-conquering-fear',
  'Joshua: Conquering Fear',
  'Learn from Joshua how to face overwhelming challenges with courage and faith in God''s promises.',
  14,
  'character',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Judges: Rebellion and Grace
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'judges-rebellion-grace',
  'Judges: The Cycle of Rebellion and Grace',
  'See God''s patience on display as Israel cycles through sin and deliverance. His grace never quits.',
  14,
  'book',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Solomon: Wisdom and Warning
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'solomon-wisdom-warning',
  'Solomon: Wisdom and Warning',
  'The wisest man who ever lived - and how he went astray. Lessons for us all.',
  14,
  'character',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Major Prophets Explained
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'major-prophets-explained',
  'Major Prophets Explained',
  'Isaiah, Jeremiah, Ezekiel, and Daniel - understand their messages and why they still matter.',
  21,
  'book',
  'intensive',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Minor Prophets Made Simple
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'minor-prophets-simple',
  'Minor Prophets Made Simple',
  'The 12 "minor" prophets pack major messages. Discover their relevance for today.',
  14,
  'book',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ✝️ NEW TESTAMENT–FOCUSED PLANS
-- ============================================

-- The Book of Acts
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'book-of-acts',
  'The Book of Acts: Birth of the Church',
  'Experience the explosive growth of the early church. The Spirit is still moving today.',
  21,
  'book',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Paul''s Letters Explained
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'pauls-letters-explained',
  'Paul''s Letters Explained',
  'A guided tour through Paul''s 13 letters. Context, themes, and application for today.',
  21,
  'book',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Romans for Everyday Christians
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'romans-everyday',
  'Romans for Everyday Christians',
  'Paul''s masterpiece made accessible. The gospel explained and applied to daily life.',
  21,
  'book',
  'medium',
  true
) ON CONFLICT (slug) DO NOTHING;

-- The Sermon on the Mount
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'sermon-on-mount',
  'The Sermon on the Mount',
  'Jesus'' most famous teaching. Kingdom values that turn the world upside down.',
  14,
  'foundational',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Revelation Without Fear
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'revelation-without-fear',
  'The Book of Revelation (Without Fear)',
  'Approach Revelation with confidence. It''s not meant to scare you - it''s meant to encourage you.',
  21,
  'book',
  'intensive',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 🧠 THEOLOGY & BIG IDEAS
-- ============================================

-- The Character of God
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'character-of-god',
  'The Character of God',
  'Who is God really? Explore His attributes through Scripture and grow in awe and trust.',
  14,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- The Trinity Explained
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'trinity-explained',
  'The Trinity Explained Through Scripture',
  'Father, Son, and Holy Spirit - one God in three persons. What the Bible teaches.',
  10,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- What Is Salvation?
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'what-is-salvation',
  'What Is Salvation?',
  'Justification, sanctification, glorification - understand the full scope of what God has done for you.',
  10,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Grace vs. Works
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'grace-vs-works',
  'Grace vs. Works',
  'Are we saved by what we do or what Christ did? Understand this crucial distinction.',
  7,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Covenants of the Bible
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'covenants-of-bible',
  'Covenants of the Bible',
  'From Noah to Abraham to Moses to David to Jesus - trace God''s covenant faithfulness.',
  14,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- The Kingdom of God
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'kingdom-of-god',
  'The Kingdom of God',
  'What did Jesus mean when He talked about the Kingdom? It''s here, it''s coming, and you''re invited.',
  14,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Sin, Repentance, and Redemption
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'sin-repentance-redemption',
  'Sin, Repentance, and Redemption',
  'The problem, the solution, and the result. God''s answer to our deepest need.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Holiness in a Broken World
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'holiness-broken-world',
  'Holiness in a Broken World',
  'What does it mean to be set apart? Practical holiness for everyday Christians.',
  14,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- The Authority of Scripture
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'authority-of-scripture',
  'The Authority of Scripture',
  'Why trust the Bible? Discover its inspiration, reliability, and transforming power.',
  7,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 🙏 SPIRITUAL GROWTH & DAILY LIVING
-- ============================================

-- Walking With God Daily
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'walking-with-god-daily',
  'Walking With God Daily',
  'Practical rhythms for a vibrant relationship with God. Small steps, big transformation.',
  21,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Learning to Pray Like Jesus
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'pray-like-jesus',
  'Learning to Pray Like Jesus',
  'Study how Jesus prayed and let His example transform your prayer life.',
  14,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Renewing Your Mind
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'renewing-your-mind',
  'Renewing Your Mind',
  'Transform your thinking with Scripture. What you think shapes who you become.',
  14,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Growing When Stuck
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'growing-when-stuck',
  'Growing Spiritually Even When You Feel Stuck',
  'Feeling spiritually dry? These passages will help you find fresh streams.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Patience, Perseverance, Endurance
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'patience-perseverance-endurance',
  'Patience, Perseverance, and Endurance',
  'The long game of faith. How to keep going when you want to give up.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Humility and Obedience
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'humility-and-obedience',
  'Humility and Obedience',
  'The foundation of spiritual growth. Learn from Jesus the posture of a servant.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Living Spirit-Led
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'living-spirit-led',
  'Living a Spirit-Led Life',
  'What does it mean to be led by the Spirit? Practical guidance for daily decisions.',
  14,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 💪 STRENGTH FOR HARD SEASONS
-- ============================================

-- God''s Promises When Life Is Hard
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'promises-when-hard',
  'God''s Promises When Life Is Hard',
  'Anchoring truths for stormy seasons. God''s Word holds when everything else shakes.',
  14,
  'life',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Biblical Encouragement for Depression
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'encouragement-depression',
  'Biblical Encouragement for Depression',
  'You''re not alone. Scripture meets you in the darkness with hope and presence.',
  14,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Hope in Suffering
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'hope-in-suffering',
  'Hope in the Midst of Suffering',
  'When pain is unavoidable, hope is still possible. God is near to the hurting.',
  14,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Waiting on God''s Timing
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'waiting-gods-timing',
  'Waiting on God''s Timing',
  'When God seems slow, He''s never late. Learning to trust His perfect timing.',
  10,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Rest for the Weary
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'rest-for-weary',
  'Rest for the Weary',
  'Exhausted? Jesus invites you to find rest in Him. True soul rest is possible.',
  7,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Spiritual Warfare
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'spiritual-warfare-strength',
  'Strength in Spiritual Warfare',
  'The battle is real but the victory is certain. How to stand firm against the enemy.',
  14,
  'life',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Peace Beyond Understanding
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'peace-beyond-understanding',
  'Peace Beyond Understanding',
  'The peace God gives doesn''t make sense - it transcends circumstances.',
  10,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- God Is Near to the Brokenhearted
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'near-to-brokenhearted',
  'God Is Near to the Brokenhearted',
  'When your heart is shattered, God draws close. His comfort is real.',
  10,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Standing Firm Under Pressure
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'standing-firm-pressure',
  'Standing Firm Under Pressure',
  'When the heat is on, your faith is tested. How to stand when everything pushes back.',
  10,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 🏠 RELATIONSHIPS, FAMILY & COMMUNITY
-- ============================================

-- Biblical Love and Marriage
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'biblical-love-marriage',
  'Biblical Love and Marriage',
  'God''s design for marriage. Love, sacrifice, and covenant commitment.',
  14,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Parenting With Godly Wisdom
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'parenting-godly-wisdom',
  'Parenting With Godly Wisdom',
  'Raising children is hard. Scripture provides wisdom for the journey.',
  14,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Friendship God''s Way
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'friendship-gods-way',
  'Friendship God''s Way',
  'What makes a true friend? Biblical wisdom for building lasting friendships.',
  10,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Conflict Resolution
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'conflict-resolution-biblical',
  'Conflict Resolution the Biblical Way',
  'Disagreements happen. Here''s how to handle them with grace and truth.',
  7,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Serving Others Like Jesus
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'serving-like-jesus',
  'Serving Others Like Jesus',
  'Jesus came to serve, not to be served. Learn to follow His example.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Unity in the Body
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'unity-body-christ',
  'Unity in the Body of Christ',
  'One body, many parts. How to pursue unity without uniformity.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Leadership Through Servanthood
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'leadership-servanthood',
  'Leadership Through Servanthood',
  'The world''s leadership model vs. Jesus'' model. Greatness through service.',
  14,
  'life',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Forgiveness in Relationships
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'forgiveness-relationships',
  'Forgiveness in Relationships',
  'Forgiving others as Christ forgave you. The path to freedom and healing.',
  10,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- The Power of Community
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'power-of-community',
  'The Power of Community',
  'You weren''t meant to do this alone. The gift and necessity of Christian community.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 🔥 PURPOSE, CALLING & DISCIPLESHIP
-- ============================================

-- Discovering Your Purpose
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'discovering-purpose',
  'Discovering Your God-Given Purpose',
  'Why am I here? What should I do with my life? Scripture speaks to your deepest questions.',
  14,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Spiritual Gifts Explained
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'spiritual-gifts-explained',
  'Spiritual Gifts Explained',
  'Every believer is gifted. Discover yours and use them to build up the body.',
  14,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Discipleship: Following Jesus
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'discipleship-following-jesus',
  'Discipleship: Following Jesus Daily',
  'What does it really mean to be a disciple? Beyond belief to lifestyle.',
  21,
  'foundational',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Living on Mission
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'living-on-mission',
  'Living on Mission',
  'You have a mission. Every Christian is called to be on mission wherever they are.',
  14,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Sharing Your Faith
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'sharing-your-faith',
  'Sharing Your Faith Boldly',
  'Evangelism doesn''t have to be scary. Learn to share naturally and confidently.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Obedience Over Comfort
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'obedience-over-comfort',
  'Obedience Over Comfort',
  'Following Jesus isn''t always comfortable. It''s always worth it.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- God''s Will for Your Life
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'gods-will-for-life',
  'God''s Will for Your Life',
  'How do I know God''s will? Biblical guidance for life''s big decisions.',
  14,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Faith at Work
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'faith-at-work',
  'Faith at Work',
  'Your job is your ministry. How to honor God from 9 to 5.',
  10,
  'life',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Integrity in a Compromised World
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'integrity-compromised-world',
  'Integrity in a Compromised World',
  'Standing for truth when everyone bends. Character that honors God.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Bearing Fruit That Lasts
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'bearing-fruit-lasts',
  'Bearing Fruit That Lasts',
  'Not just busy - fruitful. How to invest your life in what matters eternally.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 🕊️ END TIMES, HOPE & ETERNAL PERSPECTIVE
-- ============================================

-- What the Bible Says About End Times
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'bible-end-times',
  'What the Bible Says About the End Times',
  'Eschatology made accessible. What Scripture actually teaches about the future.',
  14,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Heaven, Hell, and Eternity
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'heaven-hell-eternity',
  'Heaven, Hell, and Eternity',
  'What happens after death? The Bible''s teaching on eternal destinations.',
  10,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Living Ready for Christ''s Return
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'ready-for-return',
  'Living Ready for Christ''s Return',
  'He''s coming back. How should we live in light of that promise?',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Hope in God''s Final Victory
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'hope-final-victory',
  'Hope in God''s Final Victory',
  'Evil will not win. God''s victory is certain and we share in it.',
  10,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- The New Heaven and New Earth
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'new-heaven-new-earth',
  'The New Heaven and New Earth',
  'The end of the story is glorious. See what God has prepared for those who love Him.',
  7,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- God''s Justice and Mercy
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'justice-and-mercy',
  'God''s Justice and Mercy',
  'How can God be both perfectly just and infinitely merciful? The cross is the answer.',
  10,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- The Promise of Eternal Life
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'promise-eternal-life',
  'The Promise of Eternal Life',
  'Eternal life isn''t just about length - it''s about quality. Starting now.',
  7,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 🗓️ TIME-BASED & FORMAT PLANS
-- ============================================

-- 30-Day Walk With Jesus
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  '30-day-walk-jesus',
  '30-Day Walk With Jesus',
  'A month of daily encounters with Jesus. Simple readings, powerful transformation.',
  30,
  'foundational',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- 21-Day Renewal Plan
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  '21-day-renewal',
  '21-Day Renewal Plan',
  'Three weeks to refresh your faith. Daily readings to renew your heart and mind.',
  21,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 7-Day Faith Reset
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  '7-day-faith-reset',
  '7-Day Faith Reset',
  'One week to recalibrate your soul. Quick but powerful daily readings.',
  7,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- 90-Day New Believer Plan
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  '90-day-new-believer',
  '90-Day New Believer Plan',
  'Just started following Jesus? This is your roadmap for the first three months.',
  90,
  'foundational',
  'easy',
  true
) ON CONFLICT (slug) DO NOTHING;

-- One-Year Bible Overview
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'one-year-bible-overview',
  'One-Year Bible Overview',
  'Read through the entire Bible in one year. Manageable daily portions with guidance.',
  365,
  'book',
  'intensive',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Bible in 30 Minutes a Day
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'bible-30-minutes-day',
  'Bible in 30 Minutes a Day',
  'Don''t have hours? Thirty minutes of focused Bible reading that makes a difference.',
  30,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Scripture Memory Challenge
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'scripture-memory-challenge',
  'Scripture Memory Challenge',
  'Hide God''s Word in your heart. 21 verses in 21 days with memorization tips.',
  21,
  'topical',
  'medium',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Daily Proverbs + Psalms
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'daily-proverbs-psalms',
  'Daily Proverbs + Psalms Plan',
  'Start each day with wisdom and worship. One Proverb and Psalm daily.',
  31,
  'book',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- Bible Plan for Busy Christians
INSERT INTO public.reading_plans (slug, title, description, duration_days, category, difficulty, is_featured)
VALUES (
  'bible-busy-christians',
  'Bible Plan for Busy Christians',
  'Only 10 minutes? This plan is for you. Short, impactful daily readings.',
  30,
  'topical',
  'easy',
  false
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FEATURED PLANS - FULL DAILY CONTENT
-- ============================================

-- MESSIANIC PROPHECIES FULFILLED (21 Days)
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'messianic-prophecies-fulfilled';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Born of a Virgin', '[{"book":"Isaiah","chapter":7,"verses":"14"},{"book":"Matthew","chapter":1,"verses":"18-23"}]', 'Why was the virgin birth essential for the Messiah?'),
    (plan_uuid, 2, 'Born in Bethlehem', '[{"book":"Micah","chapter":5,"verses":"2"},{"book":"Matthew","chapter":2,"verses":"1-6"}]', 'How does Jesus'' birthplace confirm His identity?'),
    (plan_uuid, 3, 'From the Line of David', '[{"book":"Jeremiah","chapter":23,"verses":"5-6"},{"book":"Matthew","chapter":1,"verses":"1-17"}]', 'Why was David''s lineage important for the Messiah?'),
    (plan_uuid, 4, 'Called Out of Egypt', '[{"book":"Hosea","chapter":11,"verses":"1"},{"book":"Matthew","chapter":2,"verses":"13-15"}]', 'How did Jesus relive Israel''s story?'),
    (plan_uuid, 5, 'Preceded by a Messenger', '[{"book":"Malachi","chapter":3,"verses":"1"},{"book":"Isaiah","chapter":40,"verses":"3-5"},{"book":"Matthew","chapter":3,"verses":"1-3"}]', 'How did John the Baptist fulfill prophecy?'),
    (plan_uuid, 6, 'Ministry in Galilee', '[{"book":"Isaiah","chapter":9,"verses":"1-2"},{"book":"Matthew","chapter":4,"verses":"12-16"}]', 'Why did Jesus focus His ministry in Galilee?'),
    (plan_uuid, 7, 'Healing and Miracles', '[{"book":"Isaiah","chapter":35,"verses":"5-6"},{"book":"Matthew","chapter":11,"verses":"2-6"}]', 'How did Jesus'' miracles prove He was the Messiah?'),
    (plan_uuid, 8, 'Speaking in Parables', '[{"book":"Psalms","chapter":78,"verses":"1-2"},{"book":"Matthew","chapter":13,"verses":"34-35"}]', 'Why did Jesus teach in parables?'),
    (plan_uuid, 9, 'Entering Jerusalem on a Donkey', '[{"book":"Zechariah","chapter":9,"verses":"9"},{"book":"Matthew","chapter":21,"verses":"1-11"}]', 'What did the triumphal entry signify?'),
    (plan_uuid, 10, 'Betrayed by a Friend', '[{"book":"Psalms","chapter":41,"verses":"9"},{"book":"John","chapter":13,"verses":"18-30"}]', 'How did betrayal fulfill Scripture?'),
    (plan_uuid, 11, 'Sold for Thirty Pieces of Silver', '[{"book":"Zechariah","chapter":11,"verses":"12-13"},{"book":"Matthew","chapter":26,"verses":"14-16"},{"book":"Matthew","chapter":27,"verses":"3-10"}]', 'Why was the price significant?'),
    (plan_uuid, 12, 'Silent Before Accusers', '[{"book":"Isaiah","chapter":53,"verses":"7"},{"book":"Matthew","chapter":27,"verses":"12-14"}]', 'Why didn''t Jesus defend Himself?'),
    (plan_uuid, 13, 'Beaten and Spat Upon', '[{"book":"Isaiah","chapter":50,"verses":"6"},{"book":"Matthew","chapter":26,"verses":"67-68"}]', 'How did Jesus endure such suffering?'),
    (plan_uuid, 14, 'Crucified with Criminals', '[{"book":"Isaiah","chapter":53,"verses":"12"},{"book":"Luke","chapter":23,"verses":"32-33"}]', 'Why was Jesus counted among transgressors?'),
    (plan_uuid, 15, 'Hands and Feet Pierced', '[{"book":"Psalms","chapter":22,"verses":"16"},{"book":"John","chapter":20,"verses":"25-27"}]', 'How specific was this prophecy?'),
    (plan_uuid, 16, 'Mocked and Scorned', '[{"book":"Psalms","chapter":22,"verses":"6-8"},{"book":"Matthew","chapter":27,"verses":"39-44"}]', 'How did the crowd''s words echo prophecy?'),
    (plan_uuid, 17, 'Given Gall and Vinegar', '[{"book":"Psalms","chapter":69,"verses":"21"},{"book":"John","chapter":19,"verses":"28-30"}]', 'What was the significance of Jesus'' thirst?'),
    (plan_uuid, 18, 'Bones Not Broken', '[{"book":"Psalms","chapter":34,"verses":"20"},{"book":"John","chapter":19,"verses":"31-36"}]', 'Why was this detail preserved?'),
    (plan_uuid, 19, 'Side Pierced', '[{"book":"Zechariah","chapter":12,"verses":"10"},{"book":"John","chapter":19,"verses":"34-37"}]', 'What did the blood and water signify?'),
    (plan_uuid, 20, 'Buried in a Rich Man''s Tomb', '[{"book":"Isaiah","chapter":53,"verses":"9"},{"book":"Matthew","chapter":27,"verses":"57-60"}]', 'How did Joseph of Arimathea fulfill prophecy?'),
    (plan_uuid, 21, 'Risen from the Dead', '[{"book":"Psalms","chapter":16,"verses":"10"},{"book":"Acts","chapter":2,"verses":"22-32"}]', 'How does the resurrection confirm Jesus is the Messiah?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- HOW WE GOT THE BIBLE (14 Days)
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'how-we-got-the-bible';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'God''s Word is Inspired', '[{"book":"2 Timothy","chapter":3,"verses":"16-17"},{"book":"2 Peter","chapter":1,"verses":"20-21"}]', 'What does it mean that Scripture is "God-breathed"?'),
    (plan_uuid, 2, 'Moses: The First Writer', '[{"book":"Exodus","chapter":24,"verses":"3-4"},{"book":"Deuteronomy","chapter":31,"verses":"24-26"}]', 'How did the written Word begin?'),
    (plan_uuid, 3, 'The Prophets Wrote God''s Words', '[{"book":"Jeremiah","chapter":36,"verses":"1-4"},{"book":"Isaiah","chapter":8,"verses":"1"}]', 'How did the prophets receive and record God''s message?'),
    (plan_uuid, 4, 'David: Poet and Prophet', '[{"book":"2 Samuel","chapter":23,"verses":"1-2"},{"book":"Acts","chapter":2,"verses":"29-31"}]', 'How did the Holy Spirit inspire the Psalms?'),
    (plan_uuid, 5, 'Solomon''s Wisdom', '[{"book":"1 Kings","chapter":4,"verses":"29-34"},{"book":"Proverbs","chapter":1,"verses":"1-7"}]', 'What role did Solomon play in Scripture?'),
    (plan_uuid, 6, 'Ezra and the Preservation of Scripture', '[{"book":"Ezra","chapter":7,"verses":"6-10"},{"book":"Nehemiah","chapter":8,"verses":"1-8"}]', 'How was Scripture preserved during exile?'),
    (plan_uuid, 7, 'Jesus Affirms the Old Testament', '[{"book":"Matthew","chapter":5,"verses":"17-18"},{"book":"Luke","chapter":24,"verses":"44-45"}]', 'How did Jesus view the Hebrew Scriptures?'),
    (plan_uuid, 8, 'The Gospels: Eyewitness Accounts', '[{"book":"Luke","chapter":1,"verses":"1-4"},{"book":"John","chapter":21,"verses":"24-25"}]', 'Why can we trust the Gospel accounts?'),
    (plan_uuid, 9, 'Paul''s Letters to the Churches', '[{"book":"Colossians","chapter":4,"verses":"16"},{"book":"2 Peter","chapter":3,"verses":"15-16"}]', 'How did Paul''s letters become Scripture?'),
    (plan_uuid, 10, 'The Apostles'' Authority', '[{"book":"1 Corinthians","chapter":14,"verses":"37"},{"book":"1 Thessalonians","chapter":2,"verses":"13"}]', 'What authority did the apostles have?'),
    (plan_uuid, 11, 'Scripture is Complete', '[{"book":"Revelation","chapter":22,"verses":"18-19"},{"book":"Jude","chapter":1,"verses":"3"}]', 'Why is the canon closed?'),
    (plan_uuid, 12, 'The Word Stands Forever', '[{"book":"Isaiah","chapter":40,"verses":"8"},{"book":"1 Peter","chapter":1,"verses":"23-25"}]', 'How has God preserved His Word?'),
    (plan_uuid, 13, 'The Word is Living and Active', '[{"book":"Hebrews","chapter":4,"verses":"12"},{"book":"James","chapter":1,"verses":"21-25"}]', 'What power does Scripture have in our lives?'),
    (plan_uuid, 14, 'Our Response to God''s Word', '[{"book":"Psalms","chapter":119,"verses":"9-16"},{"book":"Joshua","chapter":1,"verses":"8"}]', 'How should we treasure and obey Scripture?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- FROM GENESIS TO JESUS (30 Days)
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'genesis-to-jesus';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'In the Beginning', '[{"book":"Genesis","chapter":1,"verses":"1-5"},{"book":"John","chapter":1,"verses":"1-5"}]', 'How is Jesus present at creation?'),
    (plan_uuid, 2, 'The First Promise', '[{"book":"Genesis","chapter":3,"verses":"14-15"},{"book":"Galatians","chapter":4,"verses":"4-5"}]', 'How does Genesis 3:15 point to Jesus?'),
    (plan_uuid, 3, 'Noah: Salvation Through Judgment', '[{"book":"Genesis","chapter":6,"verses":"13-22"},{"book":"1 Peter","chapter":3,"verses":"20-21"}]', 'How does the ark picture salvation in Christ?'),
    (plan_uuid, 4, 'Abraham: The Promise of Blessing', '[{"book":"Genesis","chapter":12,"verses":"1-3"},{"book":"Galatians","chapter":3,"verses":"8-9"}]', 'How are all nations blessed through Abraham?'),
    (plan_uuid, 5, 'Isaac: The Beloved Son', '[{"book":"Genesis","chapter":22,"verses":"1-14"},{"book":"Hebrews","chapter":11,"verses":"17-19"}]', 'How does Isaac''s sacrifice point to Jesus?'),
    (plan_uuid, 6, 'Jacob''s Ladder', '[{"book":"Genesis","chapter":28,"verses":"10-17"},{"book":"John","chapter":1,"verses":"51"}]', 'How is Jesus the true ladder between heaven and earth?'),
    (plan_uuid, 7, 'Joseph: Rejected Then Exalted', '[{"book":"Genesis","chapter":50,"verses":"19-21"},{"book":"Acts","chapter":7,"verses":"9-10"}]', 'How does Joseph''s story mirror Jesus''?'),
    (plan_uuid, 8, 'The Passover Lamb', '[{"book":"Exodus","chapter":12,"verses":"1-13"},{"book":"1 Corinthians","chapter":5,"verses":"7"}]', 'How is Jesus our Passover Lamb?'),
    (plan_uuid, 9, 'The Bronze Serpent', '[{"book":"Numbers","chapter":21,"verses":"4-9"},{"book":"John","chapter":3,"verses":"14-15"}]', 'How did Jesus use this image to explain salvation?'),
    (plan_uuid, 10, 'The Prophet Like Moses', '[{"book":"Deuteronomy","chapter":18,"verses":"15-19"},{"book":"Acts","chapter":3,"verses":"22-26"}]', 'How is Jesus the greater Moses?'),
    (plan_uuid, 11, 'Rahab: Faith and the Scarlet Cord', '[{"book":"Joshua","chapter":2,"verses":"17-21"},{"book":"Hebrews","chapter":11,"verses":"31"}]', 'How does Rahab point to salvation by faith?'),
    (plan_uuid, 12, 'The Kinsman Redeemer', '[{"book":"Ruth","chapter":4,"verses":"1-10"},{"book":"Ephesians","chapter":1,"verses":"7"}]', 'How is Jesus our Kinsman Redeemer?'),
    (plan_uuid, 13, 'David: A Man After God''s Heart', '[{"book":"1 Samuel","chapter":16,"verses":"1-13"},{"book":"Acts","chapter":13,"verses":"22-23"}]', 'How does David''s kingship point to Jesus?'),
    (plan_uuid, 14, 'The Eternal Throne', '[{"book":"2 Samuel","chapter":7,"verses":"12-16"},{"book":"Luke","chapter":1,"verses":"31-33"}]', 'How is Jesus the fulfillment of God''s promise to David?'),
    (plan_uuid, 15, 'Solomon''s Temple', '[{"book":"1 Kings","chapter":8,"verses":"27-30"},{"book":"John","chapter":2,"verses":"19-21"}]', 'How is Jesus the true temple?'),
    (plan_uuid, 16, 'Elijah: The Prophet of Fire', '[{"book":"1 Kings","chapter":18,"verses":"36-39"},{"book":"Malachi","chapter":4,"verses":"5-6"},{"book":"Luke","chapter":1,"verses":"17"}]', 'How did Elijah prepare for Jesus?'),
    (plan_uuid, 17, 'Isaiah: The Suffering Servant', '[{"book":"Isaiah","chapter":53,"verses":"1-6"},{"book":"Acts","chapter":8,"verses":"32-35"}]', 'How does Isaiah 53 describe Jesus?'),
    (plan_uuid, 18, 'Jeremiah: The New Covenant', '[{"book":"Jeremiah","chapter":31,"verses":"31-34"},{"book":"Hebrews","chapter":8,"verses":"8-12"}]', 'How did Jesus establish the new covenant?'),
    (plan_uuid, 19, 'Ezekiel: The Good Shepherd', '[{"book":"Ezekiel","chapter":34,"verses":"11-16"},{"book":"John","chapter":10,"verses":"11-14"}]', 'How is Jesus the Good Shepherd?'),
    (plan_uuid, 20, 'Daniel: The Son of Man', '[{"book":"Daniel","chapter":7,"verses":"13-14"},{"book":"Matthew","chapter":26,"verses":"63-64"}]', 'Why did Jesus call Himself the Son of Man?'),
    (plan_uuid, 21, 'Jonah: Three Days', '[{"book":"Jonah","chapter":1,"verses":"17"},{"book":"Matthew","chapter":12,"verses":"39-41"}]', 'How is Jonah a sign of Jesus?'),
    (plan_uuid, 22, 'Micah: The Ruler from Bethlehem', '[{"book":"Micah","chapter":5,"verses":"2-4"},{"book":"Matthew","chapter":2,"verses":"4-6"}]', 'What does Bethlehem tell us about Jesus?'),
    (plan_uuid, 23, 'Zechariah: The Pierced One', '[{"book":"Zechariah","chapter":12,"verses":"10"},{"book":"John","chapter":19,"verses":"37"}]', 'How was this prophecy fulfilled?'),
    (plan_uuid, 24, 'Malachi: The Messenger', '[{"book":"Malachi","chapter":3,"verses":"1-3"},{"book":"Mark","chapter":1,"verses":"1-4"}]', 'How did John prepare the way?'),
    (plan_uuid, 25, 'The Word Became Flesh', '[{"book":"John","chapter":1,"verses":"14-18"}]', 'What does the incarnation mean for us?'),
    (plan_uuid, 26, 'Jesus: The Lamb of God', '[{"book":"John","chapter":1,"verses":"29-34"}]', 'How does this title summarize Jesus'' mission?'),
    (plan_uuid, 27, 'The Last Supper: New Covenant', '[{"book":"Luke","chapter":22,"verses":"14-20"}]', 'How does communion connect us to all of Scripture?'),
    (plan_uuid, 28, 'The Cross: It Is Finished', '[{"book":"John","chapter":19,"verses":"28-30"}]', 'What was finished on the cross?'),
    (plan_uuid, 29, 'The Resurrection: Death Defeated', '[{"book":"1 Corinthians","chapter":15,"verses":"3-8"},{"book":"1 Corinthians","chapter":15,"verses":"20-22"}]', 'Why is the resurrection essential?'),
    (plan_uuid, 30, 'The Ascension and Return', '[{"book":"Acts","chapter":1,"verses":"9-11"},{"book":"Revelation","chapter":22,"verses":"12-13"}]', 'How does the story end - and begin again?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- LIFE OF JESUS CHRONOLOGICAL (30 Days)
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'life-of-jesus-chronological';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'The Word Before Time', '[{"book":"John","chapter":1,"verses":"1-18"}]', 'What does John reveal about Jesus'' eternal nature?'),
    (plan_uuid, 2, 'The Angel''s Announcement', '[{"book":"Luke","chapter":1,"verses":"26-38"}]', 'How did Mary respond to God''s call?'),
    (plan_uuid, 3, 'Born in Bethlehem', '[{"book":"Luke","chapter":2,"verses":"1-20"}]', 'Why did God choose such humble circumstances?'),
    (plan_uuid, 4, 'The Wise Men Visit', '[{"book":"Matthew","chapter":2,"verses":"1-12"}]', 'What do the wise men teach us about worship?'),
    (plan_uuid, 5, 'Flight to Egypt and Return', '[{"book":"Matthew","chapter":2,"verses":"13-23"}]', 'How did God protect Jesus as a child?'),
    (plan_uuid, 6, 'Young Jesus in the Temple', '[{"book":"Luke","chapter":2,"verses":"41-52"}]', 'What do we learn about Jesus'' childhood?'),
    (plan_uuid, 7, 'John Prepares the Way', '[{"book":"Matthew","chapter":3,"verses":"1-12"}]', 'How did John prepare people for Jesus?'),
    (plan_uuid, 8, 'Jesus is Baptized', '[{"book":"Matthew","chapter":3,"verses":"13-17"}]', 'What was the significance of Jesus'' baptism?'),
    (plan_uuid, 9, 'Temptation in the Wilderness', '[{"book":"Matthew","chapter":4,"verses":"1-11"}]', 'How did Jesus overcome temptation?'),
    (plan_uuid, 10, 'The First Disciples', '[{"book":"John","chapter":1,"verses":"35-51"}]', 'How did Jesus call His first followers?'),
    (plan_uuid, 11, 'Water to Wine', '[{"book":"John","chapter":2,"verses":"1-12"}]', 'What does Jesus'' first miracle reveal?'),
    (plan_uuid, 12, 'Cleansing the Temple', '[{"book":"John","chapter":2,"verses":"13-25"}]', 'Why was Jesus so passionate about His Father''s house?'),
    (plan_uuid, 13, 'Nicodemus: Born Again', '[{"book":"John","chapter":3,"verses":"1-21"}]', 'What does it mean to be born again?'),
    (plan_uuid, 14, 'The Woman at the Well', '[{"book":"John","chapter":4,"verses":"1-42"}]', 'How does Jesus break barriers to reach people?'),
    (plan_uuid, 15, 'Rejected at Nazareth', '[{"book":"Luke","chapter":4,"verses":"16-30"}]', 'Why was Jesus rejected in His hometown?'),
    (plan_uuid, 16, 'The Sermon on the Mount: Beatitudes', '[{"book":"Matthew","chapter":5,"verses":"1-16"}]', 'How do the Beatitudes challenge worldly values?'),
    (plan_uuid, 17, 'The Sermon: Love Your Enemies', '[{"book":"Matthew","chapter":5,"verses":"38-48"}]', 'What does radical love look like?'),
    (plan_uuid, 18, 'The Sermon: The Lord''s Prayer', '[{"book":"Matthew","chapter":6,"verses":"5-18"}]', 'What does this prayer teach us about God?'),
    (plan_uuid, 19, 'The Twelve Apostles', '[{"book":"Luke","chapter":6,"verses":"12-16"},{"book":"Mark","chapter":3,"verses":"13-19"}]', 'Why did Jesus choose these twelve?'),
    (plan_uuid, 20, 'Parables of the Kingdom', '[{"book":"Matthew","chapter":13,"verses":"1-23"}]', 'What kind of soil is your heart?'),
    (plan_uuid, 21, 'Calming the Storm', '[{"book":"Mark","chapter":4,"verses":"35-41"}]', 'What does this reveal about Jesus'' power?'),
    (plan_uuid, 22, 'Feeding the 5000', '[{"book":"John","chapter":6,"verses":"1-15"}]', 'How does Jesus meet our deepest needs?'),
    (plan_uuid, 23, 'Walking on Water', '[{"book":"Matthew","chapter":14,"verses":"22-33"}]', 'What does Peter''s experience teach us about faith?'),
    (plan_uuid, 24, 'Peter''s Confession', '[{"book":"Matthew","chapter":16,"verses":"13-20"}]', 'Who do you say Jesus is?'),
    (plan_uuid, 25, 'The Transfiguration', '[{"book":"Matthew","chapter":17,"verses":"1-13"}]', 'Why was this glimpse of glory important?'),
    (plan_uuid, 26, 'Triumphal Entry', '[{"book":"Matthew","chapter":21,"verses":"1-11"}]', 'What kind of king is Jesus?'),
    (plan_uuid, 27, 'The Last Supper', '[{"book":"John","chapter":13,"verses":"1-17"},{"book":"Luke","chapter":22,"verses":"14-20"}]', 'What did Jesus want His disciples to remember?'),
    (plan_uuid, 28, 'Gethsemane and Arrest', '[{"book":"Matthew","chapter":26,"verses":"36-56"}]', 'How did Jesus face His darkest hour?'),
    (plan_uuid, 29, 'Trial and Crucifixion', '[{"book":"Luke","chapter":23,"verses":"1-49"}]', 'What strikes you most about Jesus'' death?'),
    (plan_uuid, 30, 'Resurrection and Commission', '[{"book":"Matthew","chapter":28,"verses":"1-20"}]', 'How does the resurrection change everything?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- BOOK OF ACTS (21 Days)
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'book-of-acts';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'The Promise of Power', '[{"book":"Acts","chapter":1,"verses":"1-11"}]', 'What did Jesus promise before ascending?'),
    (plan_uuid, 2, 'Pentecost', '[{"book":"Acts","chapter":2,"verses":"1-21"}]', 'How did the Spirit transform the disciples?'),
    (plan_uuid, 3, 'Peter''s Sermon', '[{"book":"Acts","chapter":2,"verses":"22-41"}]', 'What was the heart of Peter''s message?'),
    (plan_uuid, 4, 'Life in the Early Church', '[{"book":"Acts","chapter":2,"verses":"42-47"}]', 'What characterized this community?'),
    (plan_uuid, 5, 'Boldness Before the Council', '[{"book":"Acts","chapter":4,"verses":"1-22"}]', 'Where did Peter and John get their courage?'),
    (plan_uuid, 6, 'Ananias and Sapphira', '[{"book":"Acts","chapter":5,"verses":"1-11"}]', 'Why was God''s judgment so severe?'),
    (plan_uuid, 7, 'Stephen''s Witness', '[{"book":"Acts","chapter":7,"verses":"51-60"}]', 'How did Stephen face death?'),
    (plan_uuid, 8, 'Philip and the Ethiopian', '[{"book":"Acts","chapter":8,"verses":"26-40"}]', 'How does God orchestrate divine appointments?'),
    (plan_uuid, 9, 'Saul''s Conversion', '[{"book":"Acts","chapter":9,"verses":"1-22"}]', 'How does Saul''s story give you hope?'),
    (plan_uuid, 10, 'Peter and Cornelius', '[{"book":"Acts","chapter":10,"verses":"1-48"}]', 'What barrier did God break down?'),
    (plan_uuid, 11, 'The Church at Antioch', '[{"book":"Acts","chapter":11,"verses":"19-30"}]', 'What made Antioch significant?'),
    (plan_uuid, 12, 'Peter''s Miraculous Escape', '[{"book":"Acts","chapter":12,"verses":"1-19"}]', 'How does God answer prayer?'),
    (plan_uuid, 13, 'First Missionary Journey Begins', '[{"book":"Acts","chapter":13,"verses":"1-12"}]', 'How was Paul called and sent?'),
    (plan_uuid, 14, 'Paul at Antioch of Pisidia', '[{"book":"Acts","chapter":13,"verses":"26-52"}]', 'How did Paul preach to Jews?'),
    (plan_uuid, 15, 'The Jerusalem Council', '[{"book":"Acts","chapter":15,"verses":"1-21"}]', 'What was decided about Gentile believers?'),
    (plan_uuid, 16, 'Paul and Silas in Prison', '[{"book":"Acts","chapter":16,"verses":"16-40"}]', 'How did they respond to suffering?'),
    (plan_uuid, 17, 'Paul in Athens', '[{"book":"Acts","chapter":17,"verses":"16-34"}]', 'How did Paul adapt his message?'),
    (plan_uuid, 18, 'Paul in Corinth', '[{"book":"Acts","chapter":18,"verses":"1-17"}]', 'How did God encourage Paul?'),
    (plan_uuid, 19, 'Riot in Ephesus', '[{"book":"Acts","chapter":19,"verses":"23-41"}]', 'Why was the gospel so threatening?'),
    (plan_uuid, 20, 'Paul''s Farewell to Ephesus', '[{"book":"Acts","chapter":20,"verses":"17-38"}]', 'What was Paul''s charge to the elders?'),
    (plan_uuid, 21, 'Paul Reaches Rome', '[{"book":"Acts","chapter":28,"verses":"16-31"}]', 'How does Acts end, and what does it mean?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- ROMANS FOR EVERYDAY CHRISTIANS (21 Days)
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'romans-everyday';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'The Gospel of God', '[{"book":"Romans","chapter":1,"verses":"1-17"}]', 'Why was Paul so eager to preach the gospel?'),
    (plan_uuid, 2, 'Everyone Needs the Gospel', '[{"book":"Romans","chapter":1,"verses":"18-32"}]', 'How does sin affect all of humanity?'),
    (plan_uuid, 3, 'No One is Righteous', '[{"book":"Romans","chapter":3,"verses":"9-20"}]', 'Why can''t we save ourselves?'),
    (plan_uuid, 4, 'Justified by Faith', '[{"book":"Romans","chapter":3,"verses":"21-31"}]', 'What does justification mean for you?'),
    (plan_uuid, 5, 'Abraham''s Example', '[{"book":"Romans","chapter":4,"verses":"1-12"}]', 'How was Abraham made right with God?'),
    (plan_uuid, 6, 'Peace with God', '[{"book":"Romans","chapter":5,"verses":"1-11"}]', 'What blessings come from justification?'),
    (plan_uuid, 7, 'Adam and Christ', '[{"book":"Romans","chapter":5,"verses":"12-21"}]', 'How does Christ undo what Adam did?'),
    (plan_uuid, 8, 'Dead to Sin, Alive to God', '[{"book":"Romans","chapter":6,"verses":"1-14"}]', 'What does it mean to be dead to sin?'),
    (plan_uuid, 9, 'The Struggle with Sin', '[{"book":"Romans","chapter":7,"verses":"14-25"}]', 'Can you relate to Paul''s struggle?'),
    (plan_uuid, 10, 'No Condemnation', '[{"book":"Romans","chapter":8,"verses":"1-11"}]', 'How does the Spirit give life?'),
    (plan_uuid, 11, 'Children of God', '[{"book":"Romans","chapter":8,"verses":"12-17"}]', 'What does it mean to be adopted by God?'),
    (plan_uuid, 12, 'Future Glory', '[{"book":"Romans","chapter":8,"verses":"18-25"}]', 'How does future hope affect present suffering?'),
    (plan_uuid, 13, 'The Spirit Helps Us', '[{"book":"Romans","chapter":8,"verses":"26-30"}]', 'How does the Spirit intercede for us?'),
    (plan_uuid, 14, 'More Than Conquerors', '[{"book":"Romans","chapter":8,"verses":"31-39"}]', 'What can separate you from God''s love?'),
    (plan_uuid, 15, 'God''s Sovereign Choice', '[{"book":"Romans","chapter":9,"verses":"1-18"}]', 'How do you respond to God''s sovereignty?'),
    (plan_uuid, 16, 'Salvation for All Who Believe', '[{"book":"Romans","chapter":10,"verses":"1-17"}]', 'How do people come to faith?'),
    (plan_uuid, 17, 'Living Sacrifice', '[{"book":"Romans","chapter":12,"verses":"1-8"}]', 'What does it mean to offer yourself as a sacrifice?'),
    (plan_uuid, 18, 'Love in Action', '[{"book":"Romans","chapter":12,"verses":"9-21"}]', 'Which command is hardest for you to obey?'),
    (plan_uuid, 19, 'Submission to Authorities', '[{"book":"Romans","chapter":13,"verses":"1-14"}]', 'How should Christians relate to government?'),
    (plan_uuid, 20, 'Accepting One Another', '[{"book":"Romans","chapter":14,"verses":"1-23"}]', 'How do we handle disagreements?'),
    (plan_uuid, 21, 'Paul''s Closing', '[{"book":"Romans","chapter":15,"verses":"13"},{"book":"Romans","chapter":16,"verses":"25-27"}]', 'What is your main takeaway from Romans?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- GOD'S PROMISES WHEN LIFE IS HARD (14 Days)
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = 'promises-when-hard';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'God Will Never Leave You', '[{"book":"Deuteronomy","chapter":31,"verses":"6-8"},{"book":"Hebrews","chapter":13,"verses":"5-6"}]', 'How does God''s presence comfort you?'),
    (plan_uuid, 2, 'God''s Plans Are Good', '[{"book":"Jeremiah","chapter":29,"verses":"11-14"}]', 'How can you trust God''s plans when you can''t see them?'),
    (plan_uuid, 3, 'Nothing Can Separate You from God''s Love', '[{"book":"Romans","chapter":8,"verses":"35-39"}]', 'What circumstances tempt you to doubt God''s love?'),
    (plan_uuid, 4, 'God Gives Strength to the Weary', '[{"book":"Isaiah","chapter":40,"verses":"28-31"}]', 'Where do you need renewed strength today?'),
    (plan_uuid, 5, 'God Turns Trials into Growth', '[{"book":"James","chapter":1,"verses":"2-4"},{"book":"Romans","chapter":5,"verses":"3-5"}]', 'How has hardship grown your faith?'),
    (plan_uuid, 6, 'God''s Grace is Sufficient', '[{"book":"2 Corinthians","chapter":12,"verses":"7-10"}]', 'How can weakness become strength?'),
    (plan_uuid, 7, 'God Will Provide', '[{"book":"Philippians","chapter":4,"verses":"19"},{"book":"Matthew","chapter":6,"verses":"25-33"}]', 'What needs do you trust God to meet?'),
    (plan_uuid, 8, 'God Gives Peace', '[{"book":"John","chapter":14,"verses":"27"},{"book":"Philippians","chapter":4,"verses":"6-7"}]', 'How do you access God''s peace?'),
    (plan_uuid, 9, 'God Works All Things for Good', '[{"book":"Romans","chapter":8,"verses":"28-30"}]', 'Can you see God working even in difficult circumstances?'),
    (plan_uuid, 10, 'God''s Mercies Are New Every Morning', '[{"book":"Lamentations","chapter":3,"verses":"22-26"}]', 'What does God''s faithfulness mean to you today?'),
    (plan_uuid, 11, 'God Is Your Refuge', '[{"book":"Psalms","chapter":46,"verses":"1-7"}]', 'How can you run to God as your refuge?'),
    (plan_uuid, 12, 'God Will Complete His Work in You', '[{"book":"Philippians","chapter":1,"verses":"6"},{"book":"Hebrews","chapter":12,"verses":"1-3"}]', 'How does knowing the end encourage you now?'),
    (plan_uuid, 13, 'God Hears Your Prayers', '[{"book":"1 John","chapter":5,"verses":"14-15"},{"book":"Psalms","chapter":34,"verses":"15-18"}]', 'How does it change things to know God hears you?'),
    (plan_uuid, 14, 'God Gives Hope', '[{"book":"Romans","chapter":15,"verses":"13"},{"book":"Psalms","chapter":42,"verses":"11"}]', 'Where does your hope come from?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- 30-DAY WALK WITH JESUS (30 Days)
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = '30-day-walk-jesus';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    (plan_uuid, 1, 'Come and See', '[{"book":"John","chapter":1,"verses":"35-51"}]', 'How did Jesus invite you to follow Him?'),
    (plan_uuid, 2, 'Living Water', '[{"book":"John","chapter":4,"verses":"7-14"}]', 'What thirst does only Jesus satisfy?'),
    (plan_uuid, 3, 'The Bread of Life', '[{"book":"John","chapter":6,"verses":"35-40"}]', 'How does Jesus satisfy your hunger?'),
    (plan_uuid, 4, 'The Light of the World', '[{"book":"John","chapter":8,"verses":"12"}]', 'How does Jesus bring light to your darkness?'),
    (plan_uuid, 5, 'The Good Shepherd', '[{"book":"John","chapter":10,"verses":"11-18"}]', 'How does Jesus care for you as a shepherd?'),
    (plan_uuid, 6, 'The Resurrection and Life', '[{"book":"John","chapter":11,"verses":"25-26"}]', 'What does Jesus'' resurrection mean for you?'),
    (plan_uuid, 7, 'The Way, Truth, and Life', '[{"book":"John","chapter":14,"verses":"6-7"}]', 'How is Jesus the only way to God?'),
    (plan_uuid, 8, 'The True Vine', '[{"book":"John","chapter":15,"verses":"1-8"}]', 'How do you abide in Jesus?'),
    (plan_uuid, 9, 'Jesus Prays for You', '[{"book":"John","chapter":17,"verses":"20-26"}]', 'How does it feel to know Jesus prays for you?'),
    (plan_uuid, 10, 'Take Up Your Cross', '[{"book":"Mark","chapter":8,"verses":"34-38"}]', 'What does cross-bearing look like in your life?'),
    (plan_uuid, 11, 'Learn from Me', '[{"book":"Matthew","chapter":11,"verses":"28-30"}]', 'How do you find rest in Jesus?'),
    (plan_uuid, 12, 'Deny Yourself', '[{"book":"Luke","chapter":9,"verses":"23-26"}]', 'What must you deny to follow Jesus?'),
    (plan_uuid, 13, 'Love One Another', '[{"book":"John","chapter":13,"verses":"34-35"}]', 'How can you love as Jesus loved?'),
    (plan_uuid, 14, 'Servant of All', '[{"book":"Mark","chapter":10,"verses":"42-45"}]', 'How can you serve others today?'),
    (plan_uuid, 15, 'Ask in My Name', '[{"book":"John","chapter":14,"verses":"13-14"}]', 'What does it mean to pray in Jesus'' name?'),
    (plan_uuid, 16, 'You Are My Friends', '[{"book":"John","chapter":15,"verses":"13-17"}]', 'What does friendship with Jesus look like?'),
    (plan_uuid, 17, 'Peace I Give You', '[{"book":"John","chapter":14,"verses":"27"}]', 'How do you receive Jesus'' peace?'),
    (plan_uuid, 18, 'Be Not Afraid', '[{"book":"Mark","chapter":5,"verses":"36"}]', 'What fears do you need to surrender?'),
    (plan_uuid, 19, 'Have Faith', '[{"book":"Mark","chapter":11,"verses":"22-24"}]', 'How can your faith grow?'),
    (plan_uuid, 20, 'Watch and Pray', '[{"book":"Mark","chapter":14,"verses":"38"}]', 'How do you stay spiritually alert?'),
    (plan_uuid, 21, 'Forgive Others', '[{"book":"Matthew","chapter":6,"verses":"14-15"}]', 'Who do you need to forgive?'),
    (plan_uuid, 22, 'Do Not Judge', '[{"book":"Matthew","chapter":7,"verses":"1-5"}]', 'How can you see clearly to help others?'),
    (plan_uuid, 23, 'Seek First the Kingdom', '[{"book":"Matthew","chapter":6,"verses":"33-34"}]', 'What competes with God''s kingdom in your heart?'),
    (plan_uuid, 24, 'Ask, Seek, Knock', '[{"book":"Matthew","chapter":7,"verses":"7-11"}]', 'What do you need to ask God for today?'),
    (plan_uuid, 25, 'Let Your Light Shine', '[{"book":"Matthew","chapter":5,"verses":"14-16"}]', 'How can you shine for Jesus today?'),
    (plan_uuid, 26, 'Love Your Enemies', '[{"book":"Matthew","chapter":5,"verses":"43-48"}]', 'Who is difficult to love in your life?'),
    (plan_uuid, 27, 'Store Up Treasures in Heaven', '[{"book":"Matthew","chapter":6,"verses":"19-21"}]', 'Where is your treasure?'),
    (plan_uuid, 28, 'Build on the Rock', '[{"book":"Matthew","chapter":7,"verses":"24-27"}]', 'How are you building your life on Jesus'' words?'),
    (plan_uuid, 29, 'Go and Make Disciples', '[{"book":"Matthew","chapter":28,"verses":"18-20"}]', 'Who can you share Jesus with?'),
    (plan_uuid, 30, 'I Am With You Always', '[{"book":"Matthew","chapter":28,"verses":"20"}]', 'How does Jesus'' presence change everything?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

-- 90-DAY NEW BELIEVER PLAN (Key selections)
DO $$
DECLARE
  plan_uuid uuid;
BEGIN
  SELECT id INTO plan_uuid FROM public.reading_plans WHERE slug = '90-day-new-believer';
  IF plan_uuid IS NOT NULL THEN
    INSERT INTO public.reading_plan_days (plan_id, day_number, title, readings, reflection_prompt) VALUES
    -- Week 1: Who is God?
    (plan_uuid, 1, 'God Created Everything', '[{"book":"Genesis","chapter":1,"verses":"1-25"}]', 'What does creation reveal about God?'),
    (plan_uuid, 2, 'God Created You', '[{"book":"Genesis","chapter":1,"verses":"26-31"},{"book":"Psalms","chapter":139,"verses":"13-16"}]', 'How does it feel to be made in God''s image?'),
    (plan_uuid, 3, 'God is Holy', '[{"book":"Isaiah","chapter":6,"verses":"1-8"}]', 'What does God''s holiness mean?'),
    (plan_uuid, 4, 'God is Love', '[{"book":"1 John","chapter":4,"verses":"7-12"}]', 'How has God shown His love to you?'),
    (plan_uuid, 5, 'God is Faithful', '[{"book":"Lamentations","chapter":3,"verses":"22-26"}]', 'How have you experienced God''s faithfulness?'),
    (plan_uuid, 6, 'God is Our Father', '[{"book":"Matthew","chapter":6,"verses":"9-13"}]', 'What does it mean that God is your Father?'),
    (plan_uuid, 7, 'God Knows You', '[{"book":"Psalms","chapter":139,"verses":"1-12"}]', 'How does God''s complete knowledge comfort you?'),
    -- Week 2: Who is Jesus?
    (plan_uuid, 8, 'Jesus is God', '[{"book":"John","chapter":1,"verses":"1-14"}]', 'What does it mean that Jesus is the Word?'),
    (plan_uuid, 9, 'Jesus Was Born', '[{"book":"Luke","chapter":2,"verses":"1-20"}]', 'Why did God become human?'),
    (plan_uuid, 10, 'Jesus Taught with Authority', '[{"book":"Matthew","chapter":7,"verses":"24-29"}]', 'How do you respond to Jesus'' teaching?'),
    (plan_uuid, 11, 'Jesus Healed', '[{"book":"Mark","chapter":2,"verses":"1-12"}]', 'What does this healing reveal about Jesus?'),
    (plan_uuid, 12, 'Jesus Died for You', '[{"book":"Romans","chapter":5,"verses":"6-11"}]', 'Why did Jesus have to die?'),
    (plan_uuid, 13, 'Jesus Rose Again', '[{"book":"1 Corinthians","chapter":15,"verses":"1-11"}]', 'Why is the resurrection essential?'),
    (plan_uuid, 14, 'Jesus Will Return', '[{"book":"Acts","chapter":1,"verses":"9-11"}]', 'How should we live knowing Jesus will return?'),
    -- Week 3: What is Salvation?
    (plan_uuid, 15, 'The Problem of Sin', '[{"book":"Romans","chapter":3,"verses":"23"},{"book":"Romans","chapter":6,"verses":"23"}]', 'How has sin affected your life?'),
    (plan_uuid, 16, 'Saved by Grace', '[{"book":"Ephesians","chapter":2,"verses":"1-10"}]', 'What is the difference between grace and works?'),
    (plan_uuid, 17, 'Born Again', '[{"book":"John","chapter":3,"verses":"1-16"}]', 'Have you been born again?'),
    (plan_uuid, 18, 'A New Creation', '[{"book":"2 Corinthians","chapter":5,"verses":"17"}]', 'How are you different since coming to Christ?'),
    (plan_uuid, 19, 'Forgiven', '[{"book":"1 John","chapter":1,"verses":"9"},{"book":"Psalms","chapter":103,"verses":"8-12"}]', 'What does complete forgiveness mean to you?'),
    (plan_uuid, 20, 'Adopted', '[{"book":"Romans","chapter":8,"verses":"14-17"}]', 'What does it mean to be God''s child?'),
    (plan_uuid, 21, 'Secure', '[{"book":"John","chapter":10,"verses":"27-30"}]', 'How secure is your salvation?'),
    -- Weeks 4-13: Growing in Faith (abbreviated for space)
    (plan_uuid, 22, 'The Holy Spirit', '[{"book":"John","chapter":14,"verses":"15-27"}]', 'Who is the Holy Spirit?'),
    (plan_uuid, 23, 'The Spirit Empowers', '[{"book":"Acts","chapter":1,"verses":"8"}]', 'How does the Spirit empower you?'),
    (plan_uuid, 24, 'Walking by the Spirit', '[{"book":"Galatians","chapter":5,"verses":"16-26"}]', 'What does Spirit-led living look like?'),
    (plan_uuid, 25, 'Spiritual Gifts', '[{"book":"1 Corinthians","chapter":12,"verses":"4-11"}]', 'What gifts has God given you?'),
    (plan_uuid, 26, 'The Fruit of the Spirit', '[{"book":"Galatians","chapter":5,"verses":"22-25"}]', 'Which fruit do you need to develop?'),
    (plan_uuid, 27, 'Learning to Pray', '[{"book":"Matthew","chapter":6,"verses":"5-15"}]', 'How is your prayer life?'),
    (plan_uuid, 28, 'Why Read the Bible', '[{"book":"2 Timothy","chapter":3,"verses":"16-17"}]', 'How does Scripture help you?'),
    (plan_uuid, 29, 'The Church', '[{"book":"Acts","chapter":2,"verses":"42-47"}]', 'Why is church important?'),
    (plan_uuid, 30, 'Baptism', '[{"book":"Romans","chapter":6,"verses":"3-4"}]', 'Have you been baptized?'),
    -- Continue abbreviated
    (plan_uuid, 45, 'Loving Others', '[{"book":"1 John","chapter":4,"verses":"19-21"}]', 'How can you love others better?'),
    (plan_uuid, 60, 'Sharing Your Faith', '[{"book":"1 Peter","chapter":3,"verses":"15-16"}]', 'How can you share Jesus with others?'),
    (plan_uuid, 75, 'Fighting Temptation', '[{"book":"1 Corinthians","chapter":10,"verses":"12-13"}]', 'How do you fight temptation?'),
    (plan_uuid, 90, 'Keep Growing', '[{"book":"2 Peter","chapter":3,"verses":"18"}]', 'What''s your next step in growth?')
    ON CONFLICT (plan_id, day_number) DO NOTHING;
  END IF;
END $$;

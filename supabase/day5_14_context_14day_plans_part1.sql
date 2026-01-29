-- Day 5-14 Context for 14-Day Reading Plans - Part 1
-- Date: 2026-01-28

-- First, add the new columns if they don't exist
ALTER TABLE public.reading_plans 
ADD COLUMN IF NOT EXISTS day11_context TEXT,
ADD COLUMN IF NOT EXISTS day12_context TEXT,
ADD COLUMN IF NOT EXISTS day13_context TEXT,
ADD COLUMN IF NOT EXISTS day14_context TEXT;

-- ============================================
-- PRAYER 14 DAYS
-- ============================================
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored corporate prayer. Today we examine intercessory prayer—praying for others.

Abraham interceded for Sodom (Genesis 18). Moses interceded for rebellious Israel (Exodus 32). Paul constantly interceded for churches he planted. Jesus "always lives to intercede" for us (Hebrews 7:25).

Intercession is priestly work—standing between God and people, bringing others before God''s throne. It''s faith expressing love: we believe God hears; we love enough to ask on others'' behalf. Today we develop an intercession practice.',
day6_context = 'Day 5 examined intercession. Today we explore prayer and Scripture—praying God''s Word back to Him.

Praying Scripture guarantees we pray according to God''s will. When we pray promises, we align with what God already wants. "This is the confidence we have in approaching God: that if we ask anything according to his will, he hears us" (1 John 5:14).

Practically: read a passage, turn it into prayer, personalize it. Psalm 23 becomes: "Lord, be my shepherd today. Lead me beside quiet waters." Today we practice Scripture-shaped prayer.',
day7_context = 'Day 6 explored praying Scripture. Today we address unanswered prayer—what do we do when God seems silent?

Jesus promised: "Ask and it will be given to you" (Matthew 7:7). Yet many prayers seem unanswered. How do we reconcile promise with experience?

Possible reasons for apparent non-answers: wrong motives (James 4:3), unconfessed sin (Psalm 66:18), not according to God''s will, timing isn''t right, or God is answering differently than we expected. Today we examine our unanswered prayers with honest faith.',
day8_context = 'Day 7 addressed unanswered prayer. Today we explore prayer and fasting—intensifying prayer through self-denial.

"When you fast" (not if), Jesus said, teaching proper motivation (Matthew 6:16-18). Fasting combines prayer with physical denial, expressing urgency and dependence.

Fasting says: "This matters enough to deny my body. I need God more than food." It sharpens spiritual sensitivity and demonstrates seriousness. Jesus fasted; the early church fasted before major decisions (Acts 13:2-3). Today we consider adding fasting to prayer.',
day9_context = 'Day 8 examined prayer and fasting. Today we explore hindrances to prayer—what blocks our prayers?

Scripture identifies hindrances: unconfessed sin (Isaiah 59:2), unforgiveness (Mark 11:25), wrong motives (James 4:3), doubt (James 1:6-7), and mistreating a spouse (1 Peter 3:7).

The solution isn''t trying harder but removing obstacles. Confess sin, forgive offenders, examine motives, renew faith, repair relationships. Clear channels allow prayer to flow. Today we identify and address hindrances.',
day10_context = 'Day 9 examined hindrances. Today we explore prayer rhythms—establishing sustainable patterns.

Daniel prayed three times daily (Daniel 6:10). David prayed "evening, morning and noon" (Psalm 55:17). Jesus regularly withdrew to pray (Luke 5:16). Rhythm creates consistency.

What rhythm fits your life? Morning prayer to start the day? Midday pause? Evening review? Fixed times create space; spontaneous prayers fill gaps. Today we establish a sustainable prayer rhythm.',
day11_context = 'Day 10 explored prayer rhythms. Today we examine listening prayer—prayer isn''t just talking.

"Be still, and know that I am God" (Psalm 46:10). Prayer is dialogue, not monologue. We speak; God speaks. But do we listen?

Listening involves: creating silence (hard in our noisy world), expecting God to communicate, and recognizing His voice through Scripture, impression, circumstance, and community. Today we practice quiet listening in God''s presence.',
day12_context = 'Day 11 explored listening. Today we address prayer and worship—they''re closely connected.

"Enter his gates with thanksgiving and his courts with praise" (Psalm 100:4). Worship leads to prayer; prayer overflows into worship. They''re not separate activities but intertwined.

Prayer that begins with worship reorients our perspective. We remember who we''re addressing before presenting our requests. "Our Father in heaven, hallowed be your name" precedes "give us today." Today we let worship shape our prayers.',
day13_context = 'Day 12 connected prayer and worship. Today we explore prayer and action—prayer isn''t substitute for obedience.

Nehemiah prayed—then grabbed a trowel (Nehemiah 2:4, 4:9). Prayer and action go together. We don''t pray instead of acting; we pray and then act as God directs.

Sometimes we use prayer to avoid action: "I''ll pray about it" when we should obey what we already know. Prayer aligns us with God for action, not replaces action. Today we move from prayer to obedient response.',
day14_context = 'We''ve explored prayer''s foundations, types, persistence, community, Scripture connection, unanswered prayers, fasting, hindrances, rhythms, listening, worship, and action. Today we commit to a transformed prayer life.

"The prayer of a righteous person is powerful and effective" (James 5:16). Your prayers matter. They move heaven and change earth.

As you complete this study, what will change in your prayer life? What practices will you implement? What prayers will you persist in? Pray without ceasing—it''s the privilege of God''s children.'
WHERE slug = 'prayer-14-days';

-- ============================================
-- GOD'S LOVE 14 DAYS
-- ============================================
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored how God''s love transforms us. Today we examine love''s discipline—God loves us enough to correct us.

"The Lord disciplines the one he loves, and he chastens everyone he accepts as his son" (Hebrews 12:6). Discipline isn''t punishment but training. It proves sonship, not rejection.

Loving parents discipline children; indifferent ones don''t bother. God''s correction demonstrates His care. "No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace" (Hebrews 12:11). Today we receive discipline as love.',
day6_context = 'Day 5 examined love''s discipline. Today we explore the breadth of God''s love—it extends further than we imagine.

"God so loved the world" (John 3:16)—not just Israel, not just the religious, not just the lovable. The whole world, in all its brokenness. God''s love crosses every boundary.

This means: no one is beyond God''s love. The person you think least deserving is still loved by God. "While we were still sinners, Christ died for us" (Romans 5:8). Today we expand our understanding of love''s reach.',
day7_context = 'Day 6 explored love''s breadth. Today we examine the depth of God''s love—how far down it reaches.

"Neither height nor depth... will be able to separate us from the love of God" (Romans 8:39). No pit is too deep. No failure is too great. No wandering goes beyond His pursuit.

The prodigal son expected to be hired as a servant; the father ran to embrace him as a son. God''s love reaches into our deepest shame and darkest failure. Today we receive love that reaches the depths.',
day8_context = 'Day 7 explored love''s depth. Today we examine the persistence of God''s love—it never gives up.

"Love never fails" (1 Corinthians 13:8). God''s love doesn''t run out, wear thin, or give up. It persists through our wandering, rebellion, and repeated failures.

Hosea was told to love an unfaithful wife as a picture of God''s persistent love for unfaithful Israel. "How can I give you up?... My heart is changed within me; all my compassion is aroused" (Hosea 11:8). Today we rest in love that never quits.',
day9_context = 'Day 8 examined love''s persistence. Today we explore receiving God''s love—many know about it but don''t experience it.

Head knowledge differs from heart experience. Paul prayed that believers would "grasp how wide and long and high and deep is the love of Christ" (Ephesians 3:18). This requires revelation, not just information.

Receiving love involves: believing you''re loved (faith), meditating on love''s expressions (reflection), and opening your heart to feel loved (vulnerability). Today we move from knowing to experiencing.',
day10_context = 'Day 9 explored receiving love. Today we examine sharing God''s love—loved people become loving people.

"Dear friends, since God so loved us, we also ought to love one another" (1 John 4:11). Love received produces love given. We can''t give what we haven''t received, but what we receive must flow through us.

Who needs to receive God''s love through you today? A family member, colleague, neighbor, stranger? Love isn''t just feeling; it''s action. Today we become conduits of the love we''ve received.',
day11_context = 'Day 10 explored sharing love. Today we address love''s enemies—what blocks us from experiencing God''s love?

Shame whispers "you''re too bad to be loved." Fear warns "you''ll be rejected." Past wounds suggest "love isn''t safe." Busy-ness distracts from relationship.

These enemies must be identified and addressed. Shame is answered by the cross. Fear is cast out by perfect love (1 John 4:18). Wounds need healing. Busy-ness needs pruning. Today we confront love''s enemies.',
day12_context = 'Day 11 confronted love''s enemies. Today we explore love''s response—how should we live as beloved people?

"We love because he first loved us" (1 John 4:19). Being loved produces loving. Not as duty but as overflow. We don''t strain to love; we release what we''ve received.

Living loved means: resting in acceptance rather than striving to earn it, extending grace because we''ve received it, and facing life with confidence rooted in love. Today we live as the beloved.',
day13_context = 'Day 12 examined living loved. Today we explore eternal love—God''s love has no end.

"I have loved you with an everlasting love" (Jeremiah 31:3). God''s love didn''t begin when we believed and won''t end when we fail. It''s everlasting—before time, through time, beyond time.

This eternal love provides ultimate security. Nothing future can change what''s already eternally settled. You are loved forever. Today we anchor in everlasting love.',
day14_context = 'We''ve explored God''s love: demonstrated at the cross, securing our identity, transforming us, disciplining us, reaching broadly and deeply, persisting endlessly, being received and shared, overcoming enemies, producing response, and lasting eternally.

"And so we know and rely on the love God has for us. God is love" (1 John 4:16). Know it. Rely on it. Live in it.

As you complete this study, how has your understanding of God''s love grown? How will you receive it more fully? How will you share it more freely? You are loved—now go love.'
WHERE slug = 'gods-love-14';

-- ============================================
-- PEACE OVER ANXIETY 14 DAYS
-- ============================================
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored thought management. Today we examine the role of thanksgiving—gratitude''s power against anxiety.

"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God" (Philippians 4:6). Notice: with thanksgiving. Gratitude is essential to the prescription.

Thanksgiving shifts focus from what''s wrong to what''s right, from what we lack to what we have, from uncertainty to God''s faithfulness. It''s not denial but perspective. Today we practice anxious-moment thanksgiving.',
day6_context = 'Day 5 explored thanksgiving. Today we address anxiety''s lies—the false beliefs underlying much worry.

Anxiety whispers: "You can''t handle this." "God won''t provide." "The worst will happen." "You''re alone in this." These are lies.

Truth counters: "I can do all things through Christ" (Philippians 4:13). "My God will meet all your needs" (4:19). "We know that in all things God works for good" (Romans 8:28). "I will never leave you" (Hebrews 13:5). Today we replace anxious lies with truth.',
day7_context = 'Day 6 confronted anxiety''s lies. Today we explore the peace that guards—Philippians 4:7''s remarkable promise.

"The peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." Peace guards—it stands sentry against anxiety''s assault.

This peace "transcends understanding"—it doesn''t make rational sense given circumstances. Yet it''s real. It guards hearts (emotions) and minds (thoughts). Today we invite this supernatural peace to stand guard.',
day8_context = 'Day 7 explored guarding peace. Today we examine physical factors—anxiety isn''t only spiritual.

Sleep deprivation increases anxiety. Poor nutrition affects brain chemistry. Lack of exercise leaves stress hormones uncycled. Medical conditions can cause anxiety symptoms.

Caring for our bodies is spiritual discipline. "Do you not know that your bodies are temples of the Holy Spirit?" (1 Corinthians 6:19). Sometimes anxious minds need rested bodies. Today we address physical contributors to anxiety.',
day9_context = 'Day 8 explored physical factors. Today we examine community''s role—we need others in our anxiety battles.

"Carry each other''s burdens" (Galatians 6:2). Anxiety often drives isolation; healing often requires connection. Others can pray with us, speak truth to us, and simply be present.

James wrote: "Confess your sins to each other and pray for each other so that you may be healed" (James 5:16). Sometimes confession includes confessing our fears. Today we invite others into our anxiety struggle.',
day10_context = 'Day 9 explored community. Today we address when anxiety requires professional help—wisdom recognizes limits.

Sometimes anxiety indicates clinical conditions requiring medical treatment. Depression, panic disorder, and generalized anxiety disorder are real conditions. Seeking help isn''t weakness; it''s wisdom.

God uses medicine, counselors, and other means to bring healing. Don''t resist these helps out of false pride or misguided spirituality. "There is a time for everything... a time to heal" (Ecclesiastes 3:1, 3). Today we normalize appropriate professional help.',
day11_context = 'Day 10 addressed professional help. Today we explore anxiety about the future—one of the most common forms.

"Do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own" (Matthew 6:34). Jesus commands: stay present. Today has today''s grace; tomorrow will have tomorrow''s.

Future anxiety borrows trouble before it arrives. Most of what we worry about never happens. And if it does, grace will be there when we need it. Today we practice present-moment trust.',
day12_context = 'Day 11 addressed future anxiety. Today we explore anxiety about the past—regret and shame that won''t release.

Some anxiety comes from replaying past failures, imagining what could have been, or fearing that past sins will catch up. This backward anxiety traps us in what can''t be changed.

"Forgetting what is behind and straining toward what is ahead" (Philippians 3:13). The past is forgiven. It''s done. Present grace frees us from past shame. Today we release backward anxiety.',
day13_context = 'Day 12 addressed past anxiety. Today we examine anxiety as opportunity—it can drive us to God.

Paul wrote: "When I am weak, then I am strong" (2 Corinthians 12:10). Anxiety reveals weakness; weakness drives dependence; dependence accesses strength.

Every anxious moment is an invitation to pray, to trust, to experience God''s sufficiency. Without anxiety, we might never discover how faithful God is. Today we reframe anxiety as spiritual opportunity.',
day14_context = 'We''ve explored anxiety from every angle: Jesus'' teaching, Philippians 4''s prescription, casting cares, thought management, thanksgiving, lies, guarding peace, physical factors, community, professional help, future and past anxiety, and reframing.

"Peace I leave with you; my peace I give you" (John 14:27). Jesus'' peace is available. It''s gift, not achievement.

As you complete this study, what practices will you maintain? What truths will you remember? What support will you seek? Peace over anxiety is possible—receive it.'
WHERE slug = 'peace-over-anxiety-14';

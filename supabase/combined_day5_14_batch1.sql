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
-- Day 5-14 Context for 14-Day Reading Plans - Part 2
-- Date: 2026-01-28

-- ============================================
-- IDENTITY IN CHRIST 14 DAYS
-- ============================================
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined our identity as saints. Today we explore another truth: we are new creations.

"If anyone is in Christ, the new creation has come: The old has gone, the new is here!" (2 Corinthians 5:17). You''re not the same person you were. Something genuinely new has been created.

This isn''t self-improvement but supernatural recreation. The old nature died with Christ; a new nature was born. Today we embrace our newness rather than being defined by our old selves.',
day6_context = 'Day 5 examined new creation identity. Today we explore being God''s workmanship—His masterpiece.

"We are God''s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do" (Ephesians 2:10). "Handiwork" (Greek: poiema) gives us our word "poem." You''re God''s artwork.

You''re not an accident, mistake, or afterthought. You were deliberately crafted by the Master Artist for specific purposes. Today we receive our identity as intentionally made masterpieces.',
day7_context = 'Day 6 explored being God''s workmanship. Today we examine being members of Christ''s body—connected to each other.

"Now you are the body of Christ, and each one of you is a part of it" (1 Corinthians 12:27). Your identity is corporate as well as individual. You belong to something larger.

This means: you''re needed (every part matters), you''re connected (not meant for isolation), and your gifts serve others (not just yourself). Today we embrace our place in the body.',
day8_context = 'Day 7 explored body membership. Today we examine being citizens of heaven—our ultimate nationality.

"Our citizenship is in heaven. And we eagerly await a Savior from there, the Lord Jesus Christ" (Philippians 3:20). We''re strangers and aliens on earth; our real home is elsewhere.

Heavenly citizenship means: earth''s values aren''t ultimate; temporary losses don''t define us; and our future is secure regardless of present circumstances. Today we live as citizens of heaven temporarily stationed on earth.',
day9_context = 'Day 8 explored heavenly citizenship. Today we examine being Christ''s ambassadors—representing Him here.

"We are therefore Christ''s ambassadors, as though God were making his appeal through us" (2 Corinthians 5:20). Ambassadors represent their king in foreign territory. That''s us.

This means: we speak for Christ, we represent His interests, and our conduct reflects on Him. It''s high honor and serious responsibility. Today we embrace our ambassadorial identity.',
day10_context = 'Day 9 explored being ambassadors. Today we examine being more than conquerors—victory is ours.

"In all these things we are more than conquerors through him who loved us" (Romans 8:37). Not just conquerors but "more than." Not just surviving but thriving. Not just winning but dominating through Christ.

This identity faces trials differently. We''re not victims but victors. Challenges don''t threaten our identity; they reveal it. Today we face difficulty as those who''ve already won.',
day11_context = 'Day 10 explored being conquerors. Today we examine being friends of Jesus—remarkable intimacy.

"I no longer call you servants... Instead, I have called you friends" (John 15:15). Jesus doesn''t just tolerate us; He enjoys us. Not servants only but friends.

Servants obey; friends commune. Servants know commands; friends know hearts. Jesus shares with us what the Father has told Him. Today we embrace the friendship Jesus offers.',
day12_context = 'Day 11 explored being Jesus'' friends. Today we examine being co-heirs with Christ—sharing His inheritance.

"Now if we are children, then we are heirs—heirs of God and co-heirs with Christ" (Romans 8:17). Everything Jesus inherits, we share. The Father''s entire estate belongs to us too.

This is almost too good to believe. But it''s stated clearly. We share Christ''s inheritance—all of it. Today we receive the staggering truth of our inheritance.',
day13_context = 'Day 12 explored being co-heirs. Today we address identity attacks—the enemy''s strategy against who we are.

Satan attacked Jesus'' identity in the wilderness: "If you are the Son of God..." (Matthew 4:3). He attacks ours too: "You''re not really saved." "God doesn''t love you." "You''re worthless."

Defense requires knowing truth so well that lies are immediately recognized. When identity attacks come, counter with Scripture: "I am who God says I am." Today we prepare for identity warfare.',
day14_context = 'We''ve explored identity in Christ: children, adopted, saints, new creations, masterpieces, body members, citizens, ambassadors, conquerors, friends, and co-heirs. We''ve addressed attacks on identity.

"You are a chosen people, a royal priesthood, a holy nation, God''s special possession, that you may declare the praises of him who called you out of darkness into his wonderful light" (1 Peter 2:9).

As you complete this study, which identity truths most impact you? How will you live differently knowing who you are? You are who God says you are. Live it.'
WHERE slug = 'identity-in-christ-14';

-- ============================================
-- HOLY SPIRIT 14 DAYS
-- ============================================
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined the Spirit''s sanctifying work. Today we explore the Spirit''s gifts—supernatural abilities for service.

"There are different kinds of gifts, but the same Spirit distributes them... Now to each one the manifestation of the Spirit is given for the common good" (1 Corinthians 12:4, 7). Every believer is gifted for the body''s benefit.

Gifts include wisdom, knowledge, faith, healing, miracles, prophecy, discernment, tongues, and interpretation (1 Corinthians 12:8-10). Different lists appear elsewhere, suggesting these are representative, not exhaustive. Today we explore spiritual gifts.',
day6_context = 'Day 5 examined spiritual gifts. Today we explore the fruit of the Spirit—character produced by His presence.

"The fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control" (Galatians 5:22-23). Note: fruit (singular)—these are one package, not a buffet.

Fruit differs from gifts: gifts are given; fruit is grown. We don''t choose our gifts; fruit develops through abiding. Today we examine whether Spirit-fruit is increasingly evident in our lives.',
day7_context = 'Day 6 explored the fruit. Today we examine being led by the Spirit—divine guidance for daily life.

"Those who are led by the Spirit of God are the children of God" (Romans 8:14). Being Spirit-led is normative Christianity, not exceptional experience.

The Spirit leads through: Scripture (He never contradicts His Word), impressions (internal promptings), circumstances (doors opening and closing), counsel (wisdom from others), and peace (or its absence). Today we practice sensitivity to the Spirit''s leading.',
day8_context = 'Day 7 explored being Spirit-led. Today we examine being filled with the Spirit—ongoing empowerment.

"Be filled with the Spirit" (Ephesians 5:18). The command is continuous: "keep being filled." This isn''t one-time event but ongoing reality.

Filling involves: surrendering control (the word implies being controlled by), confessing sin that grieves Him, and actively relying on His power. We don''t earn filling; we receive it by faith. Today we seek fresh filling.',
day9_context = 'Day 8 explored being filled. Today we examine the Spirit''s empowerment for witness.

"You will receive power when the Holy Spirit comes on you; and you will be my witnesses" (Acts 1:8). The Spirit''s power is particularly for mission. Pentecost produced proclamation.

This power enables: boldness when we''d naturally fear, words when we''d naturally be speechless, and effectiveness when we''d naturally fail. The Spirit makes ordinary people extraordinary witnesses. Today we rely on the Spirit for witness.',
day10_context = 'Day 9 explored witness empowerment. Today we examine the Spirit''s intercession—He prays for us.

"The Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans" (Romans 8:26). When we can''t pray, He prays through us.

This means prayer is never hopeless. Even when words fail, the Spirit interprets our groans and presents them perfectly to the Father. Today we take comfort in the Spirit''s intercession.',
day11_context = 'Day 10 explored the Spirit''s intercession. Today we examine not grieving the Spirit—maintaining relationship.

"Do not grieve the Holy Spirit of God, with whom you were sealed for the day of redemption" (Ephesians 4:30). The Spirit can be grieved—hurt by our sin. He''s a person, not a force.

What grieves Him? The context lists: lying, anger, stealing, unwholesome talk, bitterness, rage, slander. When we sin, we grieve the One who dwells within. Today we commit to not grieving our divine Guest.',
day12_context = 'Day 11 addressed grieving the Spirit. Today we examine not quenching the Spirit—allowing Him to work.

"Do not quench the Spirit" (1 Thessalonians 5:19). The image is of fire—we can suppress what the Spirit wants to do. Quenching resists His work.

We quench by: ignoring His promptings, refusing to use gifts, dismissing prophecy without testing, and preferring control over surrender. Today we commit to letting the Spirit move freely.',
day13_context = 'Day 12 addressed quenching the Spirit. Today we examine walking in the Spirit—moment-by-moment dependence.

"Walk by the Spirit, and you will not gratify the desires of the flesh" (Galatians 5:16). Walking implies ongoing movement—step by step, moment by moment, depending on the Spirit.

Walking in the Spirit means: staying connected throughout the day, making small decisions by His guidance, and maintaining awareness of His presence. It''s not spectacular but faithful. Today we practice walking.',
day14_context = 'We''ve explored the Spirit: His person, deity, salvation work, sanctification, gifts, fruit, leading, filling, witness empowerment, intercession, grieving, quenching, and walking.

"May the grace of the Lord Jesus Christ, and the love of God, and the fellowship of the Holy Spirit be with you all" (2 Corinthians 13:14). Fellowship—shared life—with the Spirit.

As you complete this study, how will you relate to the Holy Spirit differently? What changes will you make? He''s not distant deity but present Person. Live in fellowship with Him.'
WHERE slug = 'holy-spirit-14';

-- ============================================
-- DANIEL 14 DAYS
-- ============================================
UPDATE public.reading_plans
SET day5_context = 'Day 4 witnessed Nebuchadnezzar''s humbling. Today we meet a new king and a new crisis: Belshazzar''s feast and the writing on the wall.

Belshazzar threw a party using sacred vessels from Jerusalem''s temple. A hand appeared and wrote on the wall. The king''s face "turned pale... his knees knocked together" (Daniel 5:6). No one could interpret—except Daniel.

The message: "Mene, Mene, Tekel, Parsin"—numbered, weighed, divided. That night Belshazzar was killed. Pride before the God of heaven leads to destruction. Today we see God''s judgment on presumption.',
day6_context = 'Day 5 witnessed Belshazzar''s fall. Today we enter the lions'' den—perhaps Daniel''s most famous story.

Now under Darius, Daniel''s excellence provoked jealousy. Enemies manipulated the king into decreeing death for anyone praying to any god except the king. Daniel "went home... and prayed, giving thanks to his God, just as he had done before" (Daniel 6:10).

Note: "just as he had done before." Daniel didn''t start praying because of the crisis or stop because of the danger. He continued what was already his practice. Today we examine the consistency that sustained Daniel.',
day7_context = 'Day 6 entered the lions'' den. Today we witness Daniel''s deliverance and its impact.

"My God sent his angel, and he shut the mouths of the lions" (Daniel 6:22). The same lions that destroyed Daniel''s accusers couldn''t touch him. Darius issued a decree: "People must fear and reverence the God of Daniel."

Daniel''s faithfulness didn''t just save him—it testified to the watching world. Pagan kings repeatedly acknowledged the true God because of Daniel''s witness. Today we see how personal faithfulness produces public testimony.',
day8_context = 'Day 7 saw Daniel''s deliverance. Today we shift from narrative to apocalyptic: Daniel''s vision of four beasts (chapter 7).

Four great beasts rise from the sea—representing successive empires. Then "one like a son of man" approaches the Ancient of Days and receives everlasting dominion. Jesus frequently called Himself "Son of Man," drawing on this vision.

Daniel was "troubled in spirit" (7:15) and "deeply troubled" (7:28) by this vision. Apocalyptic visions often disturbed recipients even while providing hope. Today we encounter Daniel''s prophetic visions.',
day9_context = 'Day 8 introduced apocalyptic visions. Today we examine the ram and goat vision (chapter 8)—remarkably specific prophecy.

A ram with two horns (Media-Persia) is defeated by a goat with one horn (Greece/Alexander). The goat''s horn breaks; four arise (Alexander''s generals). From one comes a "little horn" who desecrates the sanctuary—fulfilled in Antiochus Epiphanes.

This prophecy was so accurate that critics claimed it must have been written after the events. But predictive prophecy is exactly what we''d expect from an all-knowing God. Today we marvel at prophetic precision.',
day10_context = 'Day 9 examined the ram and goat. Today we witness Daniel''s prayer of confession (chapter 9)—one of Scripture''s great prayers.

Reading Jeremiah''s prophecy of 70 years, Daniel prayed for his people''s restoration. His prayer includes: acknowledging sin, appealing to God''s character, and asking for mercy not based on Israel''s righteousness but God''s.

"We do not make requests of you because we are righteous, but because of your great mercy" (Daniel 9:18). This is the posture for all prayer: not deserving but depending on mercy. Today we learn to pray like Daniel.',
day11_context = 'Day 10 examined Daniel''s prayer. Today we explore the seventy "sevens" (Daniel 9:24-27)—one of Scripture''s most debated prophecies.

Gabriel reveals a timeline: seventy "sevens" until the Anointed One comes. Various interpretations exist, but most see reference to Christ''s first coming (some to His second). The precision—predicted hundreds of years in advance—amazes.

Different Christians interpret details differently, but all agree: God has a plan, it unfolds on His timetable, and Messiah is central. Today we engage this complex prophecy with humility and wonder.',
day12_context = 'Day 11 explored the seventy sevens. Today we examine Daniel''s final vision (chapters 10-12)—spiritual warfare and future conflict.

Daniel''s prayer was heard immediately, but the answer was delayed by spiritual conflict: "The prince of the Persian kingdom resisted me twenty-one days" (Daniel 10:13). Earthly events have spiritual dimensions.

The vision details conflicts between north and south (historically: Seleucids and Ptolemies), culminating in "a time of distress such as has not happened" (12:1). Yet the end brings resurrection and reward. Today we glimpse the spiritual realm.',
day13_context = 'Day 12 examined Daniel''s final vision. Today we explore Daniel''s character—what made him the man he was.

Daniel''s distinctives: unwavering conviction (resolved not to defile himself), consistent prayer (three times daily for decades), humble dependence (always gave God credit), courage under pressure (spoke truth to kings), and long-term faithfulness (served for 70+ years).

He was "highly esteemed" (Daniel 10:11) by heaven. Today we examine which of Daniel''s qualities we need to cultivate.',
day14_context = 'We''ve journeyed through Daniel: his early resolve, Nebuchadnezzar''s dreams, the furnace, the lions'' den, apocalyptic visions, and his exceptional character.

"Those who are wise will shine like the brightness of the heavens, and those who lead many to righteousness, like the stars for ever and ever" (Daniel 12:3).

As you complete this study, what from Daniel''s life challenges you? What vision encourages you? How will you live with Daniel-like faithfulness in your Babylon? Stand firm—the Ancient of Days is sovereign.'
WHERE slug = 'daniel-14-days';
-- Day 5-14 Context for 14-Day Reading Plans - Part 3
-- Date: 2026-01-28

-- ============================================
-- LIFE OF ABRAHAM 14 DAYS
-- ============================================
UPDATE public.reading_plans
SET day5_context = 'Day 4 witnessed Abraham''s generous handling of conflict with Lot. Today we see God reaffirm His promise after Lot''s departure.

"Lift up your eyes from where you are and look north and south, east and west. All the land that you see I will give to you and your offspring forever" (Genesis 13:14-15). After Abraham gave Lot first choice, God gave Abraham everything.

Generosity born of trust loses nothing and gains everything. Abraham trusted God with the outcome; God rewarded that trust abundantly. Today we see that letting go often leads to receiving more.',
day6_context = 'Day 5 saw God''s reaffirmation. Today Abraham rescues Lot and encounters the mysterious Melchizedek.

Lot was captured by invading kings. Abraham assembled 318 trained servants, pursued, defeated the kings, and rescued Lot. Then Melchizedek—king of Salem, priest of God Most High—appeared and blessed Abraham, who gave him a tenth of everything (Genesis 14).

Hebrews explores Melchizedek as a type of Christ. This mysterious figure reminds us that God had faithful worshippers even outside Abraham''s line. Today we see Abraham the warrior and worshipper.',
day7_context = 'Day 6 introduced Melchizedek. Today we witness the covenant ceremony of Genesis 15—God''s unconditional promise.

Abraham asked how he could know God''s promises were certain. God instructed him to arrange a covenant ceremony. Then, in deep darkness, God alone (as smoking fire pot and blazing torch) passed between the pieces.

Normally both parties would pass through, taking the curse on themselves if they broke covenant. But only God passed—He took all the obligation upon Himself. Today we see unconditional promise backed by God''s own oath.',
day8_context = 'Day 7 witnessed the covenant ceremony. Today we see Abraham and Sarah''s attempt to help God through Hagar.

Sarah was barren. She suggested Abraham have a child through her servant Hagar—culturally acceptable but outside God''s plan. Ishmael was born, and conflict immediately arose between Sarah and Hagar.

Running ahead of God''s timing produces complications. The Ishmael-Isaac conflict echoes through history. Today we see the consequences of impatience and the importance of waiting for God''s way, not just God''s goal.',
day9_context = 'Day 8 examined Hagar and Ishmael. Today God reaffirms His covenant and institutes circumcision (Genesis 17).

God changed Abram''s name to Abraham ("father of many") and Sarai''s to Sarah. He promised a son through Sarah within a year. Abraham laughed—not in mockery but in astonishment. "Will a son be born to a man a hundred years old?" (Genesis 17:17).

Circumcision became the covenant sign—a permanent, physical mark of belonging to God''s people. Today we see God patiently reaffirming His promise to a still-waiting Abraham.',
day10_context = 'Day 9 saw covenant reaffirmation. Today Abraham intercedes for Sodom—bold negotiation with God.

God revealed His intention to investigate Sodom''s wickedness. Abraham, concerned for Lot, negotiated: "Will you sweep away the righteous with the wicked? What if there are fifty... forty-five... forty... thirty... twenty... ten?" (Genesis 18:23-32).

God agreed to spare the city for ten righteous. There weren''t even ten. But Abraham''s intercession reveals a heart for others and confidence to approach God boldly. Today we learn to intercede from Abraham''s example.',
day11_context = 'Day 10 witnessed intercession for Sodom. Today we see Sodom''s destruction and Lot''s rescue—the answer to Abraham''s prayer.

Angels arrived in Sodom. The city''s wickedness was confirmed. Lot and his family were urged to flee. "Lot''s wife looked back, and she became a pillar of salt" (Genesis 19:26). Sodom and Gomorrah were destroyed.

Lot was saved "as one escaping through flames" (1 Corinthians 3:15). His life was spared, but everything he''d built in Sodom was lost. Today we see the cost of worldly compromise and the limits of being rescued.',
day12_context = 'Day 11 witnessed Sodom''s destruction. Today we finally see the promise fulfilled: Isaac is born.

"Sarah became pregnant and bore a son to Abraham in his old age, at the very time God had promised him" (Genesis 21:2). Twenty-five years after the initial promise, the child of promise arrived.

Sarah laughed—this time with joy. "God has brought me laughter, and everyone who hears about this will laugh with me" (21:6). The impossible became reality. Today we celebrate promise fulfilled after long waiting.',
day13_context = 'Day 12 celebrated Isaac''s birth. Today we reach the summit: Abraham''s test on Mount Moriah.

"Take your son, your only son, whom you love—Isaac—and... sacrifice him there as a burnt offering" (Genesis 22:2). This command seems to contradict everything God had promised. Yet Abraham obeyed.

Abraham "reasoned that God could even raise the dead" (Hebrews 11:19). His faith had grown so strong that even this incomprehensible command couldn''t shake his trust. God provided a ram; Isaac was spared. Today we witness faith''s ultimate test.',
day14_context = 'We''ve journeyed with Abraham: his call, his failures, his growth, the covenant, waiting, intercession, Isaac''s birth, and the supreme test on Moriah.

"Abraham believed God, and it was credited to him as righteousness" (Romans 4:3). His faith, not his perfection, defined him.

As you complete this study, what has Abraham''s journey taught you about faith? About waiting? About trust? The father of faith was a flawed man who learned to believe God. So can you.'
WHERE slug = 'life-of-abraham-14';

-- ============================================
-- LIFE OF JOSEPH 14 DAYS
-- ============================================
UPDATE public.reading_plans
SET day5_context = 'Day 4 witnessed Joseph''s rise and fall in Egypt—from Potiphar''s house to prison. Today we see him in prison, still faithful.

Joseph didn''t know how long he''d be imprisoned or if he''d ever get out. Yet he served so faithfully that "the warden paid no attention to anything under Joseph''s care" (Genesis 39:23). He flourished even in prison.

Joseph interpreted dreams for Pharaoh''s cupbearer and baker. The cupbearer was restored but "did not remember Joseph; he forgot him" (40:23). Two more years passed. Today we see faithful perseverance when hope seems lost.',
day6_context = 'Day 5 saw Joseph waiting in prison. Today we witness his dramatic elevation—from prisoner to prime minister in a single day.

Pharaoh dreamed; no one could interpret. Finally, the cupbearer remembered Joseph. Brought before Pharaoh, Joseph interpreted the dreams: seven years of plenty, seven of famine. He proposed a solution, and Pharaoh put him in charge of everything.

"Can we find anyone like this man, one in whom is the spirit of God?" (Genesis 41:38). At age thirty, thirteen years after his brothers sold him, Joseph rose to power. Today we see God''s timing: sudden elevation after long preparation.',
day7_context = 'Day 6 witnessed Joseph''s elevation. Today we see the brothers come to Egypt—the beginning of reconciliation.

Famine struck; Jacob sent his sons to Egypt for grain. They bowed before Joseph—unknowingly fulfilling his childhood dreams. Joseph recognized them; they didn''t recognize him.

Joseph tested them, speaking harshly, accusing them of spying, demanding they bring Benjamin. "They said to one another, ''Surely we are being punished because of our brother''" (Genesis 42:21). Guilt surfaced after twenty years. Today we see reconciliation''s careful beginning.',
day8_context = 'Day 7 saw the brothers'' first visit. Today they return with Benjamin, and Joseph tests them further.

Joseph hosted a feast but still concealed his identity. He seated them in birth order (astonishing them) and gave Benjamin five times as much food. Then he planted his silver cup in Benjamin''s sack.

When the cup was found, Judah—who had suggested selling Joseph—offered himself as substitute for Benjamin. He couldn''t bear his father''s grief again. Today we see transformation: the man who abandoned one brother now sacrifices for another.',
day9_context = 'Day 8 witnessed Judah''s transformation. Today Joseph reveals himself—one of Scripture''s most emotional scenes.

Joseph couldn''t contain himself. He sent everyone out and wept so loudly that Egyptians heard. "I am Joseph! Is my father still living?" (Genesis 45:3). The brothers were terrified.

Joseph immediately reframed everything: "Do not be distressed... God sent me ahead of you to preserve life" (45:5). Not minimizing their sin but seeing God''s providence through it. Today we witness reconciliation''s climax.',
day10_context = 'Day 9 saw Joseph revealed. Today Jacob comes to Egypt—the family reunited at last.

Jacob, initially disbelieving, was persuaded that Joseph lived. God confirmed the move: "Do not be afraid to go down to Egypt, for I will make you into a great nation there" (Genesis 46:3). Jacob saw Joseph again after twenty-two years.

Seventy people entered Egypt—the beginning of the nation that would later exodus with millions. Today we see family restoration and God''s long-term plan advancing.',
day11_context = 'Day 10 witnessed the family''s move to Egypt. Today we see Jacob blessing his sons—prophetic words for each tribe.

Before dying, Jacob blessed each son, predicting their tribes'' futures. Judah received the royal promise: "The scepter will not depart from Judah... until he to whom it belongs shall come" (Genesis 49:10). Jesus descended from Judah.

Jacob also adopted Joseph''s sons Ephraim and Manasseh, crossing his hands to bless the younger over the elder—another reversal of birth order. Today we hear prophetic blessings.',
day12_context = 'Day 11 heard Jacob''s blessings. Today we witness Jacob''s death and burial—honoring the promise.

Jacob died and was embalmed Egyptian style. Joseph obtained permission to bury him in Canaan, in the cave Abraham had purchased. "A very large company" accompanied the body.

Jacob insisted on Canaan burial because the promise was for that land, not Egypt. His burial there was an act of faith in promises not yet fulfilled. Today we see hope expressed in burial location.',
day13_context = 'Day 12 saw Jacob''s burial. Today we see the brothers'' lingering fear—and Joseph''s gracious response.

With Jacob dead, the brothers feared revenge. They sent word claiming Jacob wanted Joseph to forgive them. Joseph wept—hurt that they still didn''t trust his forgiveness.

"Don''t be afraid... You intended to harm me, but God intended it for good to accomplish what is now being done, the saving of many lives" (Genesis 50:19-20). The key verse of Joseph''s story. Today we see sovereign providence and complete forgiveness.',
day14_context = 'We''ve journeyed with Joseph: from favored son to slave to prisoner to ruler, from betrayal to reconciliation to preservation of many lives.

"God intended it for good." Joseph''s story shows God''s sovereignty weaving even evil into redemptive purpose. It foreshadows Christ: betrayed by His own, sold for silver, falsely accused, exalted to save.

As you complete this study, what has Joseph''s story taught you about waiting, about forgiveness, about God''s providence? What "pit" might God be using for purposes you can''t yet see?'
WHERE slug = 'life-of-joseph-14';

-- ============================================
-- LIFE OF DAVID 14 DAYS
-- ============================================
UPDATE public.reading_plans
SET day5_context = 'Day 4 followed David through his years as a fugitive. Today we witness his friendship with Jonathan—a covenant of loyalty.

Jonathan, Saul''s son and heir, loved David and made a covenant with him. He gave David his robe, armor, and weapons—symbolically transferring his royal future. Their friendship was "wonderful, more wonderful than that of women" (2 Samuel 1:26).

Jonathan chose friendship with David over his own interests. He protected David from Saul despite the cost. Today we see friendship that sacrifices personal advantage for another''s good.',
day6_context = 'Day 5 explored David and Jonathan''s friendship. Today we see David''s mercy toward Saul—twice sparing his enemy''s life.

In a cave at En Gedi, David cut off a corner of Saul''s robe but refused to kill him: "The LORD forbid that I should... lay my hand on him; for he is the LORD''s anointed" (1 Samuel 24:6). Later, he crept into Saul''s camp and took his spear but again refused to strike.

David left vengeance to God rather than seizing opportunity. His restraint shows remarkable faith and patience. Today we learn to trust God''s timing rather than forcing outcomes.',
day7_context = 'Day 6 saw David sparing Saul. Today we witness his lowest point: living among the Philistines, pretending madness, nearly fighting against Israel.

Desperate, David fled to Gath—Goliath''s hometown. He was given a city and pretended to raid Judah while actually attacking Israel''s other enemies. When the Philistines gathered to fight Israel, David almost went with them.

Only divine intervention through suspicious Philistine commanders prevented David from fighting his own people. Even the man after God''s heart had low points. Today we see that faith doesn''t prevent failures, but God protects through them.',
day8_context = 'Day 7 explored David''s lowest point. Today we see Saul''s death and David''s response—finally becoming king.

Saul and Jonathan died fighting the Philistines on Mount Gilboa. When the news reached David, he composed a lament: "How the mighty have fallen!" (2 Samuel 1:19). No celebration—only grief for Israel''s loss.

David was first anointed king over Judah, then, after seven years, over all Israel. He conquered Jerusalem and made it his capital. The long wait was over. Today we see kingship finally realized.',
day9_context = 'Day 8 saw David become king. Today we witness his desire to build God a temple—and God''s surprising response.

David wanted to build a house for God. But God reversed it: "The LORD declares to you that the LORD himself will establish a house for you" (2 Samuel 7:11). Not a building but a dynasty.

God promised David an eternal throne. This Davidic covenant points to Christ, David''s descendant who reigns forever. David wanted to give God something; God gave David everything. Today we see grace that out-gives us.',
day10_context = 'Day 9 explored the Davidic covenant. Today we confront David''s greatest failure: Bathsheba and Uriah.

David saw Bathsheba bathing, desired her, took her, and she became pregnant. To cover his sin, he had her husband Uriah killed in battle. "The thing David had done displeased the LORD" (2 Samuel 11:27).

The man after God''s heart committed adultery and murder. Today we confront the sobering reality that no one is immune to devastating sin.',
day11_context = 'Day 10 confronted David''s sin. Today we see Nathan''s confrontation and David''s repentance.

Nathan told a story about a rich man taking a poor man''s only lamb. David''s anger flared. Nathan declared: "You are the man!" David responded immediately: "I have sinned against the LORD" (2 Samuel 12:13).

David''s repentance was genuine—Psalm 51 records his broken-hearted prayer. "The sacrifices of God are a broken spirit; a broken and contrite heart, O God, you will not despise" (Psalm 51:17). Today we see that while sin has consequences, genuine repentance receives forgiveness.',
day12_context = 'Day 11 witnessed David''s repentance. Today we see the consequences unfold—sword in David''s house.

Nathan prophesied that "the sword will never depart from your house" (2 Samuel 12:10). The child of adultery died. Amnon raped Tamar. Absalom killed Amnon. Then Absalom rebelled against David himself.

Forgiveness doesn''t eliminate consequences. David spent his later years dealing with fallout from his sin. Today we see the bitter fruit of sin even in forgiven lives.',
day13_context = 'Day 12 explored consequences. Today we witness Absalom''s rebellion and death—David''s deepest grief.

Absalom stole the hearts of Israel and forced David to flee Jerusalem. Battle ensued. David''s orders were clear: "Be gentle with the young man Absalom for my sake" (2 Samuel 18:5). But Absalom was killed.

David''s grief was unrestrained: "O my son Absalom! My son, my son Absalom! If only I had died instead of you" (2 Samuel 18:33). Father-love overwhelmed king-duty. Today we see David''s broken heart.',
day14_context = 'We''ve journeyed with David: from shepherd to king, through friendship and fugitive years, through triumph and tragedy, sin and repentance, rebellion and restoration.

"I have found David son of Jesse, a man after my own heart" (Acts 13:22). Despite failures, this was God''s assessment.

As you complete this study, what has David''s life taught you? About hearts after God? About sin''s consequences and repentance''s reality? David''s life was complicated—like ours. God''s grace was sufficient—as it is for us.'
WHERE slug = 'life-of-david-14';

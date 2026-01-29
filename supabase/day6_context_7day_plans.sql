-- Day 6 Context for 7-Day Reading Plans
-- Date: 2026-01-28

-- First, add the day6_context column if it doesn't exist
ALTER TABLE public.reading_plans 
ADD COLUMN IF NOT EXISTS day6_context TEXT;

-- ============================================
-- 7-DAY PLANS - Day 6 Context
-- ============================================

-- Sermon on the Mount 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 examined judging others. Today Jesus teaches on prayer persistence and discernment: "Ask, seek, knock."

"Ask and it will be given to you; seek and you will find; knock and the door will be opened to you" (Matthew 7:7). The verbs intensify: asking becomes seeking becomes knocking. Persistence in prayer isn''t badgering a reluctant God but aligning a willing heart with a generous Father.

Jesus moves from prayer to discernment: "Enter through the narrow gate... Watch out for false prophets" (7:13, 15). Not every path leads to life; not every teacher speaks truth. Discernment distinguishes true from false—by their fruit. Today we learn to pray persistently and discern carefully.'
WHERE slug = 'sermon-on-mount-7';

-- Easter Journey 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 5 stood at the cross on Good Friday. Today is Holy Saturday—the silent day between death and resurrection.

The disciples spent this Sabbath in shock and grief. Their hopes lay in a tomb sealed with a stone, guarded by soldiers. Everything they believed seemed dead. They didn''t yet know Sunday was coming.

We live in our own Holy Saturday: Christ has died and risen, but we await His return. Already victorious but not yet consummated. This in-between time requires faith—trusting what we can''t yet see. Today we sit with the disciples in the silence, learning to wait with hope when God seems absent.'
WHERE slug = 'easter-journey-7';

-- Wait - Day 5 was already set above. Let me continue with Day 6:

-- Easter Journey 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 sat in Holy Saturday''s silence. Today we witness the resurrection—the event that changed everything.

"He is not here; he has risen!" (Luke 24:6). The tomb was empty. The grave clothes lay folded. Jesus appeared to Mary, to the disciples, to Thomas, to over 500 witnesses. The resurrection wasn''t legend but history—attested by eyewitnesses who died rather than deny what they saw.

"If Christ has not been raised, your faith is futile; you are still in your sins" (1 Corinthians 15:17). Everything depends on the resurrection. Because He lives, we will live. Because He conquered death, so will we. Today we celebrate the foundational event of our faith.'
WHERE slug = 'easter-journey-7';

-- Christmas Story 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 explored varied responses to Christ. Today we meet the Magi—Gentiles who sought Israel''s King.

"We saw his star when it rose and have come to worship him" (Matthew 2:2). These Eastern astrologers traveled far, following celestial signs to find a Jewish king. They represent the nations coming to Israel''s light (Isaiah 60:3).

Their gifts were symbolic: gold for royalty, frankincense for deity, myrrh for mortality (used in burial). They worshipped the child-King and returned home "by another route"—avoiding Herod. Encountering Jesus changes your route. Today we see Gentile inclusion foreshadowed at Christ''s birth.'
WHERE slug = 'christmas-story-7';

-- Galatians 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 explored Spirit-empowered living. Today Paul issues practical instructions for community life.

"Carry each other''s burdens, and in this way you will fulfill the law of Christ" (Galatians 6:2). Yet also: "Each one should carry their own load" (6:5). Not contradiction but distinction: some loads we carry alone (daily responsibilities); some burdens are too heavy (crises requiring community support).

Paul warns against weariness in doing good and urges: "As we have opportunity, let us do good to all people, especially to those who belong to the family of believers" (6:10). Freedom in Christ isn''t self-focused but other-focused. Today we examine our burden-bearing and good-doing.'
WHERE slug = 'galatians-7-days';

-- Ephesians 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 explored practical Christian living. Today Paul presents spiritual warfare: the reality and the armor.

"Our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world and against the spiritual forces of evil in the heavenly realms" (Ephesians 6:12). We have real enemies in invisible realms.

Paul describes the armor: truth, righteousness, gospel readiness, faith, salvation, Scripture, and prayer. Each piece is essential; together they provide complete protection. "After you have done everything, stand" (6:13). The goal is standing firm—maintaining position against attack. Today we prepare for spiritual battle.'
WHERE slug = 'ephesians-7-days';

-- Philippians 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 followed Paul''s pursuit of Christ. Today we reach the letter''s famous passage on peace and contentment.

"Rejoice in the Lord always. I will say it again: Rejoice!" (Philippians 4:4). Paul commands joy—from prison! Joy isn''t dependent on circumstances but on relationship with Christ.

The prescription for anxiety follows: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and minds in Christ Jesus" (4:6-7). Prayer plus thanksgiving yields transcendent peace. Today we apply this formula for contentment.'
WHERE slug = 'philippians-7-days';

-- James 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 confronted worldliness. Today James addresses presumption about the future—and patience in suffering.

"Now listen, you who say, ''Today or tomorrow we will go to this or that city''... Why, you do not even know what will happen tomorrow" (James 4:13-14). Planning isn''t wrong, but presumption is. "If it is the Lord''s will, we will live and do this or that" (4:15) acknowledges God''s sovereignty.

James then turns to the rich who exploit workers—warning of judgment—before encouraging patient endurance: "Be patient, then, brothers and sisters, until the Lord''s coming" (5:7). The farmer waits for harvest; we wait for Christ. Today we learn patience in uncertain times.'
WHERE slug = 'james-7-days';

-- 1 Peter 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 explored relationships. Today Peter addresses suffering directly: it shouldn''t surprise us, and it has purpose.

"Dear friends, do not be surprised at the fiery ordeal that has come on you to test you, as though something strange were happening to you" (1 Peter 4:12). Suffering isn''t unusual for Christians; it''s expected.

Yet there''s a difference: "If you suffer as a Christian, do not be ashamed, but praise God that you bear that name" (4:16). Suffering for wrongdoing is deserved; suffering for Christ is honorable. We share in Christ''s sufferings now and will share in His glory later (5:1). Today we reframe suffering through this lens.'
WHERE slug = '1-peter-7-days';

-- 1 John 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 addressed discerning truth from error. Today John emphasizes love—the defining mark of God''s children.

"Dear friends, let us love one another, for love comes from God. Everyone who loves has been born of God and knows God. Whoever does not love does not know God, because God is love" (1 John 4:7-8).

John grounds love in God''s initiative: "This is love: not that we loved God, but that he loved us and sent his Son as an atoning sacrifice for our sins" (4:10). Love received produces love given: "Since God so loved us, we also ought to love one another" (4:11). Today we see love as both test and evidence of genuine faith.'
WHERE slug = '1-john-7-days';

-- New Year Fresh Start 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 examined perseverance. Today we focus on purpose—living with intention rather than just existing.

"For we are God''s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do" (Ephesians 2:10). You were made for something. Your life has divinely appointed purpose.

Living purposefully means: aligning daily choices with eternal values, investing time in what matters most, saying no to good things to say yes to best things, and regularly evaluating: "Am I doing what I''m called to do?" Today we examine whether our lives reflect our deepest values and God''s purposes.'
WHERE slug = 'new-year-fresh-start-7';

-- Lord''s Prayer 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 examined forgiveness. Today we turn to protection: "Lead us not into temptation, but deliver us from the evil one."

This petition acknowledges our vulnerability. We know our weakness; we need God''s guidance away from testing beyond our capacity. Paul promised: "God is faithful; he will not let you be tempted beyond what you can bear" (1 Corinthians 10:13).

"Deliver us from the evil one" recognizes a personal enemy. Satan is real and active, but God is greater. We pray for protection and deliverance, trusting God''s power over evil''s schemes. Today we learn to depend on God for spiritual protection.'
WHERE slug = 'lords-prayer-7';

-- Armor of God 7 Days
UPDATE public.reading_plans
SET day6_context = 'Day 5 examined the shield of faith. Today we explore the helmet of salvation and the sword of the Spirit.

The helmet protects the head—our thinking. "Take the helmet of salvation" (Ephesians 6:17) means protecting your mind with assurance of salvation. When doubts attack your standing with God, the helmet deflects them.

The sword of the Spirit is "the word of God"—our only offensive weapon. Jesus used Scripture against Satan''s temptation: "It is written..." (Matthew 4:4, 7, 10). Knowing and wielding Scripture enables both defense and attack. Today we sharpen our sword through Scripture study and memorization.'
WHERE slug = 'armor-of-god-7';

-- Resurrection Power
UPDATE public.reading_plans
SET day6_context = 'Day 5 explored resurrection living. Today we examine the resurrection''s implications for suffering and death.

Paul desired to know "participation in his sufferings, becoming like him in his death, and so, somehow, attaining to the resurrection from the dead" (Philippians 3:10-11). Resurrection hope transforms how we face suffering and death.

Because Jesus rose, death is not final: "Where, O death, is your victory? Where, O death, is your sting?" (1 Corinthians 15:55). We can face mortality with hope, suffering with purpose, and loss with comfort. Today we see how resurrection reframes our darkest experiences.'
WHERE slug = 'resurrection-power';

-- Grace vs Works
UPDATE public.reading_plans
SET day6_context = 'Day 5 saw how grace produces good works. Today we explore the tension: how do we pursue holiness without falling back into legalism?

"Since we live by the Spirit, let us keep in step with the Spirit" (Galatians 5:25). The image is walking together—matching our pace to the Spirit''s leading. We don''t achieve holiness through self-effort but through Spirit-dependence.

Legalism says: "I must perform to be accepted." Grace says: "I am accepted, so I want to please." The motivation shifts from fear to love, from earning to gratitude. Today we learn to pursue holiness through relationship, not rule-keeping.'
WHERE slug = 'grace-vs-works';

-- Authority of Scripture
UPDATE public.reading_plans
SET day6_context = 'Day 5 addressed interpretation. Today we examine application: how does ancient Scripture speak to modern life?

Scripture''s authority means nothing if we don''t apply it. "Do not merely listen to the word, and so deceive yourselves. Do what it says" (James 1:22). Application bridges the gap between knowing and doing.

Good application asks: What did this mean to original readers? What timeless principles does it contain? How do those principles apply to my situation? Application should be specific, personal, and actionable—not vague generalities but concrete steps. Today we practice moving from interpretation to application.'
WHERE slug = 'authority-of-scripture';

-- Rest for the Weary
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored Sabbath rest. Today we examine emotional rest—peace amidst inner turmoil.

Jesus said, "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid" (John 14:27). His peace transcends circumstances.

Emotional rest comes from: trusting God''s sovereignty (He''s in control even when I''m not), casting anxieties on Him (1 Peter 5:7), renewing minds with truth (Romans 12:2), and practicing God''s presence. Rest isn''t always sleep; sometimes it''s surrender. Today we explore finding emotional peace in life''s storms.'
WHERE slug = 'rest-for-weary';

-- Rest for the Weary - Day 6
UPDATE public.reading_plans
SET day6_context = 'Day 5 explored emotional rest. Today we examine relational rest—peace in our connections with others.

"If it is possible, as far as it depends on you, live at peace with everyone" (Romans 12:18). Relational conflict exhausts us. While we can''t control others, we can control our part: pursuing reconciliation, forgiving offenses, speaking truth in love.

Some relationships remain difficult despite our best efforts. In those cases, we release them to God, maintain appropriate boundaries, and find rest in doing what we can. Perfect relational peace awaits heaven; meanwhile, we pursue it imperfectly. Today we examine relationships draining our rest and what we can do about them.'
WHERE slug = 'rest-for-weary';

-- Conflict Resolution Biblical
UPDATE public.reading_plans
SET day6_context = 'Day 5 explored restoration. Today we examine what to do when reconciliation doesn''t happen—living with unresolved conflict.

Jesus'' pattern continues: "If they still refuse to listen, tell it to the church; and if they refuse to listen even to the church, treat them as you would a pagan or a tax collector" (Matthew 18:17). Some conflicts don''t resolve. What then?

We can forgive without reconciling—releasing the debt to God while maintaining necessary boundaries. We continue to pray for the other person, remain open to restoration if they change, and trust God with the outcome. We''ve done what we can. Today we learn to live peacefully even with unresolved situations.'
WHERE slug = 'conflict-resolution-biblical';

-- New Heaven New Earth
UPDATE public.reading_plans
SET day6_context = 'Day 5 noted there''s no temple in the New Jerusalem. Today we explore another striking absence: no more sea.

"Then I saw ''a new heaven and a new earth,'' for the first heaven and the first earth had passed away, and there was no longer any sea" (Revelation 21:1). In ancient symbolism, the sea represented chaos, danger, and separation from God.

No more sea means: no more chaos, no more threat, no more barrier between peoples (the sea divided nations), no more source of the beast (Revelation 13:1). Everything dangerous and threatening will be gone. Today we anticipate a world without the chaos that currently troubles us.'
WHERE slug = 'new-heaven-new-earth';

-- Promise of Eternal Life
UPDATE public.reading_plans
SET day6_context = 'Day 5 examined eternal security. Today we explore eternal life''s quality—what will it be like?

"Now we see only a reflection as in a mirror; then we shall see face to face. Now I know in part; then I shall know fully, even as I am fully known" (1 Corinthians 13:12). Perfect knowledge, unhindered relationship, complete understanding.

Eternal life includes: unbroken fellowship with God, reunion with loved ones in Christ, meaningful activity and service, perfected worship, and ongoing discovery of God''s infinite being. Far from boring, eternity will be endlessly rich. Today we anticipate the life that awaits.'
WHERE slug = 'promise-eternal-life';

-- 7-Day Faith Reset
UPDATE public.reading_plans
SET day6_context = 'Day 5 emphasized community. Today we address mission—faith reset includes looking outward, not just inward.

"You are the light of the world... let your light shine before others, that they may see your good deeds and glorify your Father in heaven" (Matthew 5:14, 16). Faith exists not for our benefit alone but for the world''s.

A faith reset that focuses only on personal growth misses the point. We''re blessed to be a blessing. Consider: Who in your life needs to see Jesus through you? What good deeds might point others to God? Today we expand our reset beyond self-improvement to include missional living.'
WHERE slug = '7-day-faith-reset';

-- Day 5 Context for 7-Day Reading Plans
-- Date: 2026-01-28

-- First, add the day5_context column if it doesn't exist
ALTER TABLE public.reading_plans 
ADD COLUMN IF NOT EXISTS day5_context TEXT;

-- ============================================
-- 7-DAY PLANS - Day 5 Context
-- ============================================

-- Sermon on the Mount 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined Jesus'' teaching on worry and anxiety. Today we explore His teaching on judging others—one of the most misquoted passages in Scripture.

"Do not judge, or you too will be judged" (Matthew 7:1). This doesn''t prohibit all evaluation—Jesus commands discernment elsewhere. The prohibition is against hypocritical judgment: condemning others for faults while ignoring our own.

The image is absurd: someone with a plank in their eye offering to remove a speck from another''s. Jesus isn''t forbidding helping others see clearly; He''s requiring self-examination first. "First take the plank out of your own eye, and then you will see clearly" (Matthew 7:5). Today we learn the proper order: humble self-examination precedes helpful correction.'
WHERE slug = 'sermon-on-mount-7';

-- Easter Journey 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 entered Gethsemane''s anguish. Today we witness Good Friday—the darkest day that became our brightest hope.

Jesus was betrayed, arrested, tried in sham courts, beaten, mocked, and crucified. "My God, my God, why have you forsaken me?" (Matthew 27:46). The Son experienced abandonment by the Father as He bore the world''s sin.

Yet every element fulfilled prophecy: the silence before accusers (Isaiah 53:7), the gambling for clothes (Psalm 22:18), the piercing (Zechariah 12:10), even His words from the cross. What seemed like tragedy was actually triumph. Today we stand at the cross, where love and justice met, where death died, where redemption was accomplished.'
WHERE slug = 'easter-journey-7';

-- Christmas Story 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 heard the angelic announcement to shepherds. Today we witness the shepherds'' response—and learn what authentic worship looks like.

"The shepherds returned, glorifying and praising God for all the things they had heard and seen" (Luke 2:20). They came, they saw, they worshipped, they told others. The pattern of encounter with Christ remains: experience Him, worship Him, share Him.

Mary responded differently: "Mary treasured up all these things and pondered them in her heart" (Luke 2:19). Some worship is exuberant proclamation; some is quiet contemplation. Both are valid responses to Christ. Today we explore varied expressions of genuine worship.'
WHERE slug = 'christmas-story-7';

-- Galatians 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined justification by faith. Today Paul turns to practical application: living by the Spirit rather than by the flesh.

"Walk by the Spirit, and you will not gratify the desires of the flesh" (Galatians 5:16). The Christian life isn''t trying harder but trusting more—not self-effort but Spirit-dependence. The Spirit produces fruit; we simply abide.

Paul contrasts flesh-works (sexual immorality, hatred, jealousy, fits of rage) with Spirit-fruit (love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control). "Against such things there is no law" (5:23). Freedom in Christ isn''t freedom to sin but freedom to produce what law demanded but couldn''t enable. Today we explore Spirit-empowered living.'
WHERE slug = 'galatians-7-days';

-- Ephesians 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored unity in the body of Christ. Today Paul turns to practical instructions: living worthy of our calling.

"Be very careful, then, how you live—not as unwise but as wise, making the most of every opportunity" (Ephesians 5:15-16). Doctrine (chapters 1-3) leads to duty (chapters 4-6). What we believe shapes how we behave.

Paul addresses speech (no unwholesome talk), relationships (forgiveness as Christ forgave), sexuality (flee immorality), and work (serve as unto the Lord). Every area of life falls under Christ''s lordship. Today we examine how the high theology of Ephesians produces transformed daily living.'
WHERE slug = 'ephesians-7-days';

-- Philippians 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored the Christ hymn of Philippians 2. Today Paul turns autobiographical: his own pursuit of knowing Christ.

"I want to know Christ—yes, to know the power of his resurrection and participation in his sufferings" (Philippians 3:10). Paul, who had every religious credential, counted it all "garbage" compared to gaining Christ.

This isn''t the testimony of a failure but of an achiever who discovered something better. "Forgetting what is behind and straining toward what is ahead, I press on toward the goal" (3:13-14). Christian life is forward-focused pursuit, not backward-looking complacency. Today we examine Paul''s relentless passion to know Christ more.'
WHERE slug = 'philippians-7-days';

-- James 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined James on the tongue. Today he confronts worldliness—friendship with the world versus friendship with God.

"You adulterous people, don''t you know that friendship with the world means enmity against God?" (James 4:4). Strong language! James uses the adultery metaphor because spiritual unfaithfulness is that serious.

Worldliness shows in: quarrels from selfish desires, asking God with wrong motives, pride, and presumption about the future. The antidote? "Submit yourselves, then, to God. Resist the devil, and he will flee from you. Come near to God and he will come near to you" (4:7-8). Today we examine where worldly thinking has infiltrated our hearts.'
WHERE slug = 'james-7-days';

-- 1 Peter 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined suffering as a Christian. Today Peter provides instructions for relationships: within the church, within marriage, and with all people.

"All of you, be like-minded, be sympathetic, love one another, be compassionate and humble. Do not repay evil with evil or insult with insult" (1 Peter 3:8-9). Christian character shows most clearly in how we treat others—especially those who treat us badly.

Peter gives specific instructions for wives, husbands, and all believers. The consistent theme: humble service, even when unreciprocated. Christ is our model: "When they hurled their insults at him, he did not retaliate" (2:23). Today we examine our relationships through Peter''s lens.'
WHERE slug = '1-peter-7-days';

-- 1 John 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored assurance of salvation. Today John tackles false teaching—how to recognize truth from error.

"Dear friends, do not believe every spirit, but test the spirits to see whether they are from God" (1 John 4:1). Not everything spiritual is from God. Discernment is necessary.

The test: "Every spirit that acknowledges that Jesus Christ has come in the flesh is from God" (4:2). This targets the Gnostic heresy that denied Jesus'' true humanity. Sound doctrine about Christ is non-negotiable. Love without truth is sentimentality; truth without love is harshness. Today we learn to hold both together.'
WHERE slug = '1-john-7-days';

-- New Year Fresh Start 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored grace for when we fail. Today we examine perseverance—how to maintain momentum beyond initial enthusiasm.

New Year enthusiasm fades. What sustains long-term faithfulness? "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up" (Galatians 6:9). The promise is conditional: we reap if we don''t give up.

Perseverance requires: community support (we can''t do it alone), realistic expectations (progress isn''t linear), grace for setbacks (failure isn''t final), and focus on Christ (not just our goals). Today we build structures for sustainable spiritual growth throughout the year.'
WHERE slug = 'new-year-fresh-start-7';

-- Lord''s Prayer 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined "Give us today our daily bread." Today we turn to forgiveness: "Forgive us our debts, as we also have forgiven our debtors."

This petition is unsettling. We ask God to forgive us as we forgive others. Jesus underscored the point: "If you do not forgive others their sins, your Father will not forgive your sins" (Matthew 6:15).

This doesn''t mean we earn forgiveness by forgiving, but that genuine reception of forgiveness transforms us into forgiving people. If we harbor unforgiveness, we haven''t truly experienced what we''ve received. Today we examine whether our forgiveness of others matches what we''ve been forgiven.'
WHERE slug = 'lords-prayer-7';

-- Armor of God 7 Days
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored the shoes of the gospel of peace. Today we examine the shield of faith—our active defense against the enemy''s attacks.

"Take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one" (Ephesians 6:16). Roman soldiers'' shields were large enough to cover the whole body and could interlock with others for group defense.

Satan''s "flaming arrows" are accusations, doubts, lies, and temptations. Faith extinguishes them by trusting God''s character and promises. When accusations come: "There is now no condemnation for those who are in Christ Jesus" (Romans 8:1). When doubts attack: "He who began a good work in you will carry it on to completion" (Philippians 1:6). Today we practice raising the shield.'
WHERE slug = 'armor-of-god-7';

-- Resurrection Power
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined what the resurrection means for us. Today we explore resurrection living: how resurrection power operates in daily life.

Paul prayed "to know... the power of his resurrection" (Philippians 3:10)—not just as future hope but as present reality. "I have been crucified with Christ and I no longer live, but Christ lives in me" (Galatians 2:20). Resurrection life is Christ''s life in us now.

This power is available for: overcoming sin, enduring suffering, serving others, facing death without fear, and persevering through trials. The same power that raised Jesus animates those who believe. Today we explore accessing resurrection power for everyday challenges.'
WHERE slug = 'resurrection-power';

-- Grace vs Works
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined the relationship between law and grace. Today we explore the result of grace: transformation that produces good works.

"For we are God''s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do" (Ephesians 2:10). We''re saved by grace through faith, not by works—but we''re saved for works.

Grace produces what law demanded but couldn''t enable. The Spirit within accomplishes what self-effort could never achieve. Good works don''t save us; they evidence that we''ve been saved. Today we see how grace, properly understood, produces more holiness than law ever could.'
WHERE slug = 'grace-vs-works';

-- Authority of Scripture
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored sufficiency. Today we examine application: how do we correctly interpret and apply Scripture?

"Do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth" (2 Timothy 2:15). Scripture can be handled incorrectly—misinterpreted, misapplied, taken out of context.

Sound interpretation considers: the original meaning (what did it mean to first readers?), literary context (what surrounds this passage?), historical context (what was happening then?), and canonical context (how does this fit the whole Bible?). Today we develop skills for rightly handling God''s Word.'
WHERE slug = 'authority-of-scripture';

-- Rest for the Weary
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored Sabbath rest. Today we examine emotional rest—peace amidst inner turmoil.

Jesus said, "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid" (John 14:27). His peace transcends circumstances.

Emotional rest comes from: trusting God''s sovereignty (He''s in control even when I''m not), casting anxieties on Him (1 Peter 5:7), renewing minds with truth (Romans 12:2), and practicing God''s presence. Rest isn''t always sleep; sometimes it''s surrender. Today we explore finding emotional peace in life''s storms.'
WHERE slug = 'rest-for-weary';

-- Conflict Resolution Biblical
UPDATE public.reading_plans
SET day5_context = 'Day 4 addressed confrontation. Today we explore restoration—the goal of biblical conflict resolution.

"If your brother or sister sins against you, go and point out their fault, just between the two of you. If they listen to you, you have won them over" (Matthew 18:15). The goal is winning them over, not winning the argument.

Reconciliation differs from resolution: you can resolve a conflict (agree to disagree) without full reconciliation (restored relationship). Aim for reconciliation when possible. "If it is possible, as far as it depends on you, live at peace with everyone" (Romans 12:18). Today we explore what reconciled relationships look like.'
WHERE slug = 'conflict-resolution-biblical';

-- New Heaven New Earth
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored eternal activity. Today we examine a striking feature: there is no temple in the New Jerusalem.

"I did not see a temple in the city, because the Lord God Almighty and the Lamb are its temple" (Revelation 21:22). Throughout Scripture, temples mediated God''s presence. No longer needed—God dwells directly with His people.

This is the ultimate fulfillment of God''s purpose: "They will be his people, and God himself will be with them and be their God" (Revelation 21:3). No more barriers, no more mediation, no more distance. Face-to-face communion with God forever. Today we anticipate this unmediated presence.'
WHERE slug = 'new-heaven-new-earth';

-- Promise of Eternal Life
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored eternal life as present reality. Today we examine eternal life''s security—can it be lost?

Jesus said, "I give them eternal life, and they shall never perish; no one will snatch them out of my hand" (John 10:28). Strong promise! Add the Father''s protection: "No one can snatch them out of my Father''s hand" (10:29). Double security.

Yet warnings exist about falling away. How do we reconcile these? Those who truly belong to Christ will persevere—not perfectly, but ultimately. Those who completely abandon faith demonstrate they were never truly Christ''s (1 John 2:19). Today we find assurance in God''s keeping power while taking warnings seriously.'
WHERE slug = 'promise-eternal-life';

-- 7-Day Faith Reset
UPDATE public.reading_plans
SET day5_context = 'Day 4 discussed spiritual disciplines. Today we explore community: why faith was never meant to be solo.

"Let us not give up meeting together, as some are in the habit of doing, but let us encourage one another" (Hebrews 10:25). Faith grows in community; it withers in isolation.

We need others to: encourage us when we''re down, challenge us when we''re complacent, correct us when we''re wrong, and celebrate with us when we succeed. The "one another" commands require one anothers. Today we examine our connections: Are you known? Are you accountable? Are you serving? A faith reset includes reconnecting with community.'
WHERE slug = '7-day-faith-reset';
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
-- Day 7 Context for 7-Day Reading Plans
-- Date: 2026-01-28

-- First, add the day7_context column if it doesn't exist
ALTER TABLE public.reading_plans 
ADD COLUMN IF NOT EXISTS day7_context TEXT;

-- ============================================
-- 7-DAY PLANS - Day 7 Context (Final Day)
-- ============================================

-- Sermon on the Mount 7 Days
UPDATE public.reading_plans
SET day7_context = 'You''ve journeyed through Jesus'' greatest sermon. Today we reach His concluding challenge: building on the rock.

"Everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock" (Matthew 7:24). The Sermon on the Mount demands response—not just admiration but action.

Both builders heard the words; only one acted on them. When storms came, the difference was revealed. Jesus ends not with "Nice teaching, wasn''t it?" but with an urgent call: Will you do what I''ve said? The Sermon on the Mount isn''t meant to be admired but obeyed. As you finish this plan, what specific application will you implement?'
WHERE slug = 'sermon-on-mount-7';

-- Easter Journey 7 Days
UPDATE public.reading_plans
SET day7_context = 'We''ve walked from Palm Sunday through the resurrection. Today we reach the Great Commission—the risen Christ sending His followers.

"All authority in heaven and on earth has been given to me. Therefore go and make disciples of all nations" (Matthew 28:18-19). The resurrection wasn''t the end but a new beginning. Jesus didn''t return to resume His old life but to launch His global mission through His followers.

The same commission extends to us. We''re resurrection witnesses, carrying the message that changed everything. As you complete this Easter journey, how will you live differently because of what you''ve encountered? The empty tomb demands a response.'
WHERE slug = 'easter-journey-7';

-- Christmas Story 7 Days
UPDATE public.reading_plans
SET day7_context = 'We''ve journeyed from prophecy through birth to the Magi''s visit. Today we reflect on the incarnation''s meaning—God with us.

"The Word became flesh and made his dwelling among us" (John 1:14). God didn''t send instructions; He came Himself. Immanuel means "God with us"—not observing from a distance but entering our mess, our pain, our mortality.

Christmas isn''t just a story to hear but a reality to embrace. God came near so we could come near. As you complete this plan, consider: How does the incarnation change how you approach God? How does knowing He entered your world affect how you live in it?'
WHERE slug = 'christmas-story-7';

-- Galatians 7 Days
UPDATE public.reading_plans
SET day7_context = 'We''ve explored freedom in Christ, justification by faith, and Spirit-empowered living. Today Paul concludes with a final warning and blessing.

"Neither circumcision nor uncircumcision means anything; what counts is the new creation" (Galatians 6:15). External markers—religious rituals, cultural identity—don''t matter. What matters is being made new in Christ.

Paul bore the marks of Jesus on his body—scars from persecution (6:17). His commitment was total. As you finish Galatians, ask: Am I living in the freedom Christ purchased, or have I returned to slavery? Grace is free, but it cost Jesus everything and calls us to transformed lives.'
WHERE slug = 'galatians-7-days';

-- Ephesians 7 Days
UPDATE public.reading_plans
SET day7_context = 'We''ve explored riches in Christ, unity in the body, and spiritual warfare. Today Paul concludes with a call to prayerful watchfulness.

"Pray in the Spirit on all occasions with all kinds of prayers and requests. With this in mind, be alert and always keep on praying" (Ephesians 6:18). The armor is put on through prayer; the battle is fought on our knees.

Ephesians began with praise for spiritual blessings and ends with a call to prayerful dependence. Everything between—identity, unity, relationships, warfare—requires prayer. As you complete this letter, consider establishing or deepening a prayer rhythm. The Christian life that Ephesians describes is impossible apart from prayerful communion with God.'
WHERE slug = 'ephesians-7-days';

-- Philippians 7 Days
UPDATE public.reading_plans
SET day7_context = 'We''ve discovered joy in all circumstances and the secret of contentment. Today Paul concludes with thanks and benediction.

"I can do all this through him who gives me strength" (Philippians 4:13). Often misquoted for athletic achievements, this verse is about contentment—handling plenty or want through Christ''s power.

The Philippians had partnered with Paul in the gospel (4:15). Their financial gift prompted this thank-you letter that became Scripture. As you finish Philippians, what partnership in the gospel might God be calling you to? What circumstances need joy that only comes from Christ? Carry Paul''s letter with you beyond this week.'
WHERE slug = 'philippians-7-days';

-- James 7 Days
UPDATE public.reading_plans
SET day7_context = 'We''ve explored faith that works: taming tongues, resisting worldliness, planning humbly. Today James concludes with prayer and restoration.

"Is anyone among you in trouble? Let them pray. Is anyone happy? Let them sing songs of praise. Is anyone among you sick? Let them call the elders of the church to pray" (James 5:13-14). James points to prayer as the resource for every condition.

He ends with restoration: "Whoever turns a sinner from the error of their way will save them from death" (5:20). Faith works not just for our own benefit but for others'' rescue. As you complete James, consider: Is your faith producing the works he describes? Where do you need to apply his practical wisdom?'
WHERE slug = 'james-7-days';

-- 1 Peter 7 Days
UPDATE public.reading_plans
SET day7_context = 'We''ve explored hope in suffering and holy living as strangers in this world. Today Peter concludes with instructions for leaders and final encouragement.

"Cast all your anxiety on him because he cares for you. Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion" (1 Peter 5:7-8). Two postures: restful trust (casting anxiety) and alert vigilance (watching for the enemy).

Peter promises: "After you have suffered a little while, [God] will himself restore you and make you strong, firm and steadfast" (5:10). Suffering is real but temporary; restoration is certain. As you finish 1 Peter, how will you face suffering differently? What anxieties need casting?'
WHERE slug = '1-peter-7-days';

-- 1 John 7 Days
UPDATE public.reading_plans
SET day7_context = 'We''ve explored walking in light, testing spirits, and loving one another. Today John concludes with confidence in prayer and final warnings.

"This is the confidence we have in approaching God: that if we ask anything according to his will, he hears us" (1 John 5:14). Prayer aligned with God''s will receives His ear—and His answer.

John ends with: "Dear children, keep yourselves from idols" (5:21). The closing words seem abrupt until we remember: anything that takes God''s place is an idol. Love for God must remain supreme. As you finish 1 John, examine: What competes for God''s place in your life? How will you walk in light and love?'
WHERE slug = '1-john-7-days';

-- New Year Fresh Start 7 Days
UPDATE public.reading_plans
SET day7_context = 'You''ve spent a week resetting your faith. Today we look forward—maintaining momentum through the year ahead.

"Forgetting what is behind and straining toward what is ahead, I press on toward the goal to win the prize for which God has called me heavenward in Christ Jesus" (Philippians 3:13-14). The reset is just the beginning; the race continues.

What will you carry from this week? Perhaps a renewed commitment to Scripture, reconnection with community, clarity about purpose, or simply restored relationship with God. Write down your key takeaways. Plan how to maintain them. This fresh start was God''s gift—steward it well throughout the year ahead.'
WHERE slug = 'new-year-fresh-start-7';

-- Lord''s Prayer 7 Days
UPDATE public.reading_plans
SET day7_context = 'We''ve unpacked each phrase of the prayer Jesus taught. Today we put it all together and consider: How will we pray?

"For yours is the kingdom and the power and the glory forever. Amen." This doxology (added in some manuscripts) returns where we began: focused on God. Prayer that starts and ends with God stays properly oriented.

The Lord''s Prayer isn''t meant to replace personal prayer but to pattern it: begin with worship, align with God''s purposes, bring daily needs, seek relational health, request protection, and close with praise. As you finish this study, let the Lord''s Prayer shape your prayer life—not as rote recitation but as living conversation with your Father.'
WHERE slug = 'lords-prayer-7';

-- Armor of God 7 Days
UPDATE public.reading_plans
SET day7_context = 'We''ve examined each piece of armor. Today we put it all on and stand ready for battle.

"Therefore put on the full armor of God, so that when the day of evil comes, you may be able to stand your ground, and after you have done everything, to stand" (Ephesians 6:13). The goal is standing—maintaining position against attack.

The armor isn''t optional equipment for spiritual Navy SEALs; it''s standard issue for every believer. The battle is real; the enemy is active; the armor is essential. As you complete this study, commit to daily suiting up: truth, righteousness, gospel readiness, faith, salvation, Scripture, and prayer. Stand firm.'
WHERE slug = 'armor-of-god-7';

-- Resurrection Power
UPDATE public.reading_plans
SET day7_context = 'We''ve explored the resurrection''s reality, evidence, and implications. Today we commit to living as resurrection people.

"Since, then, you have been raised with Christ, set your hearts on things above, where Christ is, seated at the right hand of God" (Colossians 3:1). Resurrection changes our orientation—we''re already seated with Christ in heavenly places.

Resurrection people live differently: with hope in despair, courage in danger, generosity in scarcity, and joy in suffering. Death has lost its sting; fear has lost its grip. As you finish this study, how will resurrection power reshape your daily life? The power that raised Jesus is at work in you.'
WHERE slug = 'resurrection-power';

-- Grace vs Works
UPDATE public.reading_plans
SET day7_context = 'We''ve navigated the relationship between grace, faith, and works. Today we embrace both sides of the gospel coin.

"Continue to work out your salvation with fear and trembling, for it is God who works in you to will and to act in order to fulfill his good purpose" (Philippians 2:12-13). We work because God works. Our effort and His grace aren''t opposites but partners.

As you finish this study, rest in grace while pursuing holiness. Trust Christ''s finished work while doing the good works prepared for you. Avoid both legalism (earning by effort) and license (ignoring obedience). Grace received produces grace reflected—a life transformed by love, not duty.'
WHERE slug = 'grace-vs-works';

-- Authority of Scripture
UPDATE public.reading_plans
SET day7_context = 'We''ve explored Scripture''s inspiration, inerrancy, sufficiency, and application. Today we commit to a life under its authority.

"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work" (2 Timothy 3:16-17). Scripture equips us completely for God''s purposes.

Intellectual assent to Scripture''s authority means nothing if we don''t live under it. As you complete this study, examine: Do I approach Scripture expecting God to speak? Do I obey what it says, even when uncomfortable? Do I let it correct my assumptions? The Bible''s authority is proven in submission, not just affirmation.'
WHERE slug = 'authority-of-scripture';

-- Rest for the Weary
UPDATE public.reading_plans
SET day7_context = 'We''ve explored physical, emotional, and relational rest. Today we embrace the ultimate rest: rest in Christ.

"Come to me, all you who are weary and burdened, and I will give you rest" (Matthew 11:28). The invitation remains open. Jesus doesn''t offer tips for better time management; He offers Himself.

Rest isn''t something we achieve but Someone we receive. As you finish this study, where will you continue finding rest? Not by trying harder to relax but by coming to Jesus daily, casting burdens, trusting His sovereignty, and walking in His easy yoke. He is your rest.'
WHERE slug = 'rest-for-weary';

-- Conflict Resolution Biblical
UPDATE public.reading_plans
SET day7_context = 'We''ve learned biblical principles for addressing and resolving conflict. Today we commit to being peacemakers.

"Blessed are the peacemakers, for they will be called children of God" (Matthew 5:9). Peacemaking is a family trait—it reflects our Father''s character. He made peace through the cross; we extend that peace to others.

Peacemaking isn''t avoiding conflict but engaging it redemptively. It requires courage (to confront), humility (to examine ourselves first), grace (to forgive), and wisdom (to know when to speak and when to wait). As you complete this study, consider: Where is God calling you to be a peacemaker? What conflict needs the principles you''ve learned?'
WHERE slug = 'conflict-resolution-biblical';

-- New Heaven New Earth
UPDATE public.reading_plans
SET day7_context = 'We''ve glimpsed our eternal home: no death, no tears, no temple, no sea. Today we ask: How should this future shape our present?

"Since everything will be destroyed in this way, what kind of people ought you to be? You ought to live holy and godly lives as you look forward to the day of God" (2 Peter 3:11-12). Eschatology produces ethics—what we believe about the future shapes how we live now.

If this world is temporary and the next is eternal, invest accordingly. Hold things loosely; hold relationships tightly. Work for justice knowing it will be fully realized. Comfort the grieving with real hope. As you finish this study, let heaven''s reality transform earth''s priorities.'
WHERE slug = 'new-heaven-new-earth';

-- Promise of Eternal Life
UPDATE public.reading_plans
SET day7_context = 'We''ve explored eternal life''s meaning, present reality, security, and quality. Today we live as people of eternity.

"Since, then, you have been raised with Christ, set your hearts on things above" (Colossians 3:1). Eternal life begins now—we''re already citizens of heaven living temporarily on earth.

This perspective changes everything: fear of death diminishes, temporal losses shrink in significance, and eternal investments gain priority. "Our light and momentary troubles are achieving for us an eternal glory that far outweighs them all" (2 Corinthians 4:17). As you complete this study, how will eternal perspective reshape your daily priorities and decisions?'
WHERE slug = 'promise-eternal-life';

-- 7-Day Faith Reset
UPDATE public.reading_plans
SET day7_context = 'You''ve spent a week returning to the basics. Today we seal the reset and step forward in renewed faith.

"Create in me a pure heart, O God, and renew a steadfast spirit within me" (Psalm 51:10). David''s prayer for renewal is our prayer too. The reset was God''s work—we simply positioned ourselves to receive it.

What has God shown you this week? What truths need remembering? What practices need resuming? What relationships need reconnecting? Write down your key commitments. Share them with a trusted friend for accountability. A faith reset is only as good as the follow-through. Go now, walk with God, and live the renewed faith He''s given you.'
WHERE slug = '7-day-faith-reset';

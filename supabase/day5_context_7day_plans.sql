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

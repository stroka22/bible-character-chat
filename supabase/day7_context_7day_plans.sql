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

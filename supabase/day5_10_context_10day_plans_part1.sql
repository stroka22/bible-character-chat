-- Day 5-10 Context for 10-Day Reading Plans - Part 1
-- Date: 2026-01-28

-- First, add the new columns if they don't exist
ALTER TABLE public.reading_plans 
ADD COLUMN IF NOT EXISTS day8_context TEXT,
ADD COLUMN IF NOT EXISTS day9_context TEXT,
ADD COLUMN IF NOT EXISTS day10_context TEXT;

-- ============================================
-- 10-DAY PLANS - Part 1: Topical Studies
-- ============================================

-- FORGIVENESS 10 DAYS
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored forgiving yourself. Today we examine what forgiveness is NOT—clearing up common misconceptions.

Forgiveness is NOT: forgetting (we may always remember); condoning (we don''t approve the wrong); excusing (we don''t minimize the offense); reconciliation (which requires two parties); removing consequences (legal or natural results may remain); or trusting again (trust must be earned).

Understanding what forgiveness isn''t helps us embrace what it is: a decision to release the debt, trusting God for justice, and refusing to let bitterness control us. Today we clarify our understanding and remove false barriers to forgiveness.',
day6_context = 'Day 5 clarified what forgiveness is not. Today we explore the cost of unforgiveness—what happens when we refuse to forgive.

Unforgiveness is a prison we build for ourselves. "See to it that no one falls short of the grace of God and that no bitter root grows up to cause trouble and defile many" (Hebrews 12:15). Bitterness spreads and contaminates.

Physically, unforgiveness produces stress hormones and health problems. Relationally, it poisons other connections. Spiritually, it hinders prayer and blocks God''s forgiveness of us (Matthew 6:15). Today we count the cost and ask: Is holding onto this offense worth what it''s costing me?',
day7_context = 'Day 6 examined unforgiveness''s cost. Today we look at radical forgiveness—forgiving the unforgivable.

Some offenses seem beyond forgiveness: abuse, betrayal, violence against loved ones. Yet Jesus forgave His executioners from the cross: "Father, forgive them, for they do not know what they are doing" (Luke 23:34). Stephen, being stoned, echoed: "Lord, do not hold this sin against them" (Acts 7:60).

Such forgiveness is humanly impossible. It requires supernatural grace. We can''t manufacture it; we can only receive it from God and extend it to others. Today we face our hardest cases, acknowledging our inability and asking for divine enabling.',
day8_context = 'Day 7 tackled radical forgiveness. Today we explore ongoing forgiveness—what to do when the same person offends repeatedly.

Peter asked, "Lord, how many times shall I forgive my brother or sister who sins against me? Up to seven times?" Jesus answered, "Not seven times, but seventy-seven times" (Matthew 18:21-22). Not a literal count but unlimited forgiveness.

This doesn''t mean tolerating ongoing abuse without boundaries. It means our disposition remains forgiving rather than vengeful. We can forgive while also protecting ourselves from continued harm. Today we navigate the balance between repeated forgiveness and wise boundaries.',
day9_context = 'Day 8 addressed repeated forgiveness. Today we examine seeking forgiveness—what to do when we''re the offender.

"If you are offering your gift at the altar and there remember that your brother or sister has something against you, leave your gift there... First go and be reconciled" (Matthew 5:23-24). Seeking forgiveness is as important as granting it.

A genuine apology includes: acknowledging specific wrong, accepting responsibility (no "but..."), expressing sorrow for the impact, asking for forgiveness, and committing to change. "I''m sorry you feel that way" isn''t an apology. Today we consider who we might need to approach.',
day10_context = 'We''ve explored forgiveness from every angle. Today we commit to a lifestyle of forgiveness.

"Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you" (Ephesians 4:32). The measure of our forgiveness is Christ''s forgiveness of us—unlimited.

As you complete this study, take inventory: Is there anyone you need to forgive? Anyone whose forgiveness you need to seek? Any bitterness taking root? Forgiveness isn''t a one-time event but a way of life for those who''ve been forgiven much. Walk in freedom—the freedom Christ died to give.'
WHERE slug = 'forgiveness-10-days';

-- HOPE IN HARD TIMES 10 DAYS
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined hope anchored in promises. Today we explore hope''s expression: how to maintain hope practically when circumstances are crushing.

Hope expresses itself through: prayer (taking burdens to God), community (receiving encouragement from others), worship (reminding ourselves of God''s character), Scripture (meditating on truth), and perseverance (continuing faithful action despite feelings).

Paul described his experience: "We are hard pressed on every side, but not crushed; perplexed, but not in despair; persecuted, but not abandoned; struck down, but not destroyed" (2 Corinthians 4:8-9). The difference between "pressed" and "crushed" is hope. Today we practice hope''s practical expressions.',
day6_context = 'Day 5 explored hope''s practical expressions. Today we examine a specific source: testimonies of God''s faithfulness—past evidences that sustain present hope.

"I will remember the deeds of the LORD; yes, I will remember your miracles of long ago" (Psalm 77:11). When present circumstances seem hopeless, remembering past faithfulness sustains us.

Keep a record of God''s faithfulness: answered prayers, unexpected provisions, guidance in decisions, comfort in grief. In dark times, review this record. What God has done, He can do again. "Jesus Christ is the same yesterday and today and forever" (Hebrews 13:8). Today we build our own monument of remembrance.',
day7_context = 'Day 6 emphasized remembering God''s faithfulness. Today we explore hope for others—how to give hope to those who are struggling.

"Praise be to the God and Father of our Lord Jesus Christ... who comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves receive from God" (2 Corinthians 1:3-4). Our suffering equips us to comfort others.

Hope-giving involves: presence (being with), listening (not rushing to fix), empathy (feeling with), encouragement (speaking truth gently), and patience (allowing time). Today we consider who in our lives needs the hope we''ve received.',
day8_context = 'Day 7 explored giving hope to others. Today we examine hope''s ultimate ground: the resurrection of Jesus Christ.

"Praise be to the God and Father of our Lord Jesus Christ! In his great mercy he has given us new birth into a living hope through the resurrection of Jesus Christ from the dead" (1 Peter 1:3). Hope is living because Christ is living.

If Jesus rose, death is defeated, sin is paid for, and God''s promises are certain. The resurrection validates everything Christ claimed and everything Scripture promises. Today we anchor our hope in resurrection reality—the historical event that guarantees our future.',
day9_context = 'Day 8 grounded hope in resurrection. Today we look forward: hope for Christ''s return and the restoration of all things.

"But our citizenship is in heaven. And we eagerly await a Savior from there, the Lord Jesus Christ" (Philippians 3:20). Christian hope isn''t wishful thinking but confident expectation based on promise.

Christ will return, bodies will be raised, creation will be renewed, and all wrongs will be made right. "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain" (Revelation 21:4). Today we lift our eyes to ultimate hope.',
day10_context = 'We''ve explored hope from every angle: its foundation, expression, testimonies, sharing, resurrection ground, and ultimate fulfillment. Today we commit to living as hope-filled people.

"We have this hope as an anchor for the soul, firm and secure" (Hebrews 6:19). Hope anchors us when storms rage. It''s not denial of difficulty but confidence despite difficulty.

As you complete this study, what hope truths will you carry forward? What practices will sustain your hope? Who needs the hope you''ve received? Live as people of hope—resurrection people who know how the story ends.'
WHERE slug = 'hope-in-hard-times-10';

-- WORK AND CALLING 10 DAYS
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored work-life balance. Today we examine a common struggle: dealing with difficult colleagues and bosses.

"Slaves, obey your earthly masters with respect and fear, and with sincerity of heart, just as you would obey Christ" (Ephesians 6:5). Paul''s instructions to slaves apply to employees: respect authority, work sincerely, serve as unto Christ—even when bosses are difficult.

This doesn''t mean tolerating abuse, but it does mean maintaining integrity regardless of others'' behavior. "Do not be overcome by evil, but overcome evil with good" (Romans 12:21). Today we consider how to honor Christ when workplace relationships are challenging.',
day6_context = 'Day 5 addressed difficult colleagues. Today we explore ambition: is it godly or worldly?

Scripture doesn''t condemn ambition but channels it. "Make it your ambition to lead a quiet life: You should mind your own business and work with your hands" (1 Thessalonians 4:11). Ambition for godly character and faithful service is commendable; ambition for self-advancement at others'' expense is worldly.

The test: Are you serving or climbing? Are you contributing or competing? Is God glorified or self exalted? Godly ambition seeks excellence for God''s glory, not personal empire-building. Today we examine our motives.',
day7_context = 'Day 6 examined ambition. Today we explore the workplace as mission field—your colleagues are your congregation.

"You are the light of the world... let your light shine before others, that they may see your good deeds and glorify your Father in heaven" (Matthew 5:14, 16). Your workplace is where you shine. Colleagues observe your integrity, attitude, and response to pressure.

Workplace witness involves: excellence that draws questions, character that stands out, compassion for struggling coworkers, and readiness to explain your hope when asked (1 Peter 3:15). Today we view our workplace as ministry assignment.',
day8_context = 'Day 7 explored workplace witness. Today we address success and failure: how do we handle both in godly ways?

In success: "Remember the LORD your God, for it is he who gives you the ability to produce wealth" (Deuteronomy 8:18). Success is stewarded, not celebrated selfishly. Give God glory; share with others; remain humble.

In failure: "Though a righteous man falls seven times, he rises again" (Proverbs 24:16). Failure isn''t final. Learn what you can, accept responsibility, make amends if needed, and move forward. Neither success nor failure defines you—Christ does. Today we prepare for both.',
day9_context = 'Day 8 addressed success and failure. Today we explore transitions: when God calls you to something new.

Sometimes God moves us: new jobs, new cities, new seasons. "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight" (Proverbs 3:5-6).

Transitions require: discerning God''s leading (through prayer, Scripture, counsel, circumstances), trusting His timing (not rushing or resisting), and faithful finishing (leaving well, not just leaving). Today we consider whether God might be preparing a transition—or calling us to stay faithfully.',
day10_context = 'We''ve explored work as calling, vocation, excellence, relationships, witness, ambition, handling results, and transitions. Today we commit to working for God''s glory.

"Whatever you do, work at it with all your heart, as working for the Lord, not for human masters" (Colossians 3:23). Your work matters to God—not just your "ministry work" but all your work.

As you complete this study, how will you approach Monday differently? What changes will you make? How will you view your workplace as calling? Work isn''t a necessary evil but a divine assignment. Do it heartily, as for the Lord.'
WHERE slug = 'work-and-calling-10';

-- FINANCIAL WISDOM 10 DAYS
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined debt. Today we explore saving and planning—wisdom for the future without anxiety about it.

"The wise store up choice food and olive oil, but fools gulp theirs down" (Proverbs 21:20). Wise people save; fools consume everything. Yet Jesus warned against storing up treasures on earth obsessively. What''s the balance?

Save wisely but hold loosely. Plan prudently but trust ultimately. Emergency funds, retirement provisions, and children''s education are wise—if not at the expense of generosity or at the cost of anxiety. "Do not worry about tomorrow" (Matthew 6:34) doesn''t mean don''t plan; it means don''t fret. Today we pursue wise planning with peaceful trust.',
day6_context = 'Day 5 addressed saving and planning. Today we examine a crucial attitude: gratitude—the antidote to financial worry.

"Give thanks in all circumstances; for this is God''s will for you in Christ Jesus" (1 Thessalonians 5:18). Gratitude shifts focus from what we lack to what we have. It recognizes every good gift as from God (James 1:17).

Grateful people are generous people—they recognize abundance even when accounts show scarcity. Ungrateful people hoard even when blessed with plenty. Gratitude enables contentment, fuels generosity, and defeats anxiety. Today we cultivate thanksgiving as a financial discipline.',
day7_context = 'Day 6 emphasized gratitude. Today we explore teaching the next generation—passing financial wisdom to children.

"Start children off on the way they should go, and even when they are old they will not turn from it" (Proverbs 22:6). Financial discipleship begins young: giving, saving, spending wisely, working hard, and trusting God.

Practical steps: give children opportunities to earn, teach giving before spending, allow age-appropriate financial decisions (and consequences), model generosity and contentment, and discuss money openly (not as taboo). Today we consider what financial legacy we''re building for the next generation.',
day8_context = 'Day 7 addressed teaching children. Today we examine trusting God when finances are tight—practical faith in scarcity.

"I was young and now I am old, yet I have never seen the righteous forsaken or their children begging bread" (Psalm 37:25). God provides for His people—sometimes miraculously, often through ordinary means like work and community.

Tight times test our theology: Do we really believe God provides? Practical steps: seek additional income if possible, cut expenses ruthlessly, accept help from church family without shame, and maintain generosity even in scarcity (the widow''s mite principle). Today we trust God practically.',
day9_context = 'Day 8 addressed financial scarcity. Today we explore financial decision-making—how to make wise money choices.

Wise decisions consider: Is it within my means (don''t spend what you don''t have)? Have I prayed about it (invited God into the decision)? Have I sought counsel (Proverbs 15:22)? Does it align with values (or just wants)? What''s the opportunity cost (what else could this money accomplish)?

Major purchases deserve major reflection. Impulse buying is usually unwise buying. "Be very careful, then, how you live—not as unwise but as wise" (Ephesians 5:15). Today we develop a framework for financial decisions.',
day10_context = 'We''ve explored stewardship, generosity, contentment, debt, saving, gratitude, teaching children, trusting in scarcity, and decision-making. Today we commit to financial faithfulness.

"Whoever can be trusted with very little can also be trusted with much" (Luke 16:10). Financial faithfulness in small things prepares us for larger stewardship. God entrusts resources to trustworthy managers.

As you complete this study, what financial changes will you make? What habits need forming or breaking? How will you hold money loosely while managing it wisely? Financial freedom isn''t about amount but attitude—trusting God and serving His purposes with whatever He provides.'
WHERE slug = 'financial-wisdom-10';

-- TEN COMMANDMENTS 10 DAYS
UPDATE public.reading_plans
SET day5_context = 'Day 4 examined the third commandment (misusing God''s name). Today we explore the fourth: "Remember the Sabbath day by keeping it holy" (Exodus 20:8).

God commanded rest—one day in seven set apart from labor. He modeled it Himself in creation, not because He was tired but to establish the pattern. The Sabbath was gift before it was command: "The Sabbath was made for man, not man for the Sabbath" (Mark 2:27).

Christians debate Sabbath application today. Some observe Saturday, some Sunday, some a different day. What''s not debatable: we need rhythms of rest and worship. God designed us for work-rest cycles. Today we examine our rhythms: Are we resting, or are we running ourselves ragged?',
day6_context = 'Day 5 examined Sabbath rest. Today we explore the fifth commandment: "Honor your father and your mother" (Exodus 20:12).

This is the first commandment with a promise: "so that you may live long in the land." Society''s health depends on healthy families; families depend on honoring parents. This doesn''t mean agreeing with everything they do but treating them with respect and care.

For children: obedience. For adults: honor even when obedience no longer applies. For aging parents: care provision. "If anyone does not provide for their relatives, and especially for their own household, they have denied the faith" (1 Timothy 5:8). Today we examine how we honor our parents.',
day7_context = 'Day 6 examined honoring parents. Today we explore the sixth commandment: "You shall not murder" (Exodus 20:13).

This prohibits unlawful killing of another person—not capital punishment (prescribed in the same law) or just war, but murder from hatred. Jesus deepened it: "Anyone who is angry with a brother or sister will be subject to judgment" (Matthew 5:22). The murderous act begins with murderous heart.

We may not kill, but do we hate? Do we assassinate character if not body? Do we harbor anger that, given opportunity, would destroy? Today we examine our hearts for any deadly attitudes.',
day8_context = 'Day 7 examined murder (and anger). Today we explore the seventh commandment: "You shall not commit adultery" (Exodus 20:14).

Marriage is a covenant—a binding promise. Adultery breaks that covenant, violating trust and causing incalculable damage to spouses, children, and communities. "Marriage should be honored by all, and the marriage bed kept pure" (Hebrews 13:4).

Jesus deepened it: "Anyone who looks at a woman lustfully has already committed adultery with her in his heart" (Matthew 5:28). Sexual faithfulness begins in the mind. Today we guard our hearts and honor marriage—our own or the institution itself.',
day9_context = 'Day 8 examined adultery. Today we explore commandments eight and nine: "You shall not steal" and "You shall not give false testimony" (Exodus 20:15-16).

Stealing takes what isn''t ours—obviously through theft, but also through unfair wages, fraud, cheating, and dishonest business practices. The positive command: "Anyone who has been stealing must steal no longer, but must work, doing something useful" (Ephesians 4:28).

False testimony includes lying in court but extends to all deceit. "Do not lie to each other" (Colossians 3:9). Truth-telling is foundational to trust, and trust is foundational to society. Today we examine our honesty in possessions and words.',
day10_context = 'We''ve explored nine commandments. Today we reach the tenth: "You shall not covet" (Exodus 20:17).

This commandment goes entirely internal—coveting is desiring what belongs to another. You can keep the other nine externally while breaking this one constantly. It addresses the root from which other sins grow: desire for what isn''t ours.

Covetousness is behind theft, adultery, lying, and even murder (James 4:2). The antidote is contentment: "I have learned to be content whatever the circumstances" (Philippians 4:11). As you complete this study, how will the Ten Commandments shape your life? They reveal God''s character and our need for grace.'
WHERE slug = 'ten-commandments-10';

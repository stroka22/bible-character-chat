-- Fix Day 5-14 Context for 14-Day Plans - Corrected Slugs
-- Many plans had incorrect slugs in the UPDATE statements
-- Date: 2026-01-29

-- Spirit-Led Living (14-day plan)
UPDATE public.reading_plans
SET day5_context = 'Day 4 explored the Spirit''s sanctifying work. Today we examine specific guidance—how does the Spirit lead?

"Those who are led by the Spirit of God are the children of God" (Romans 8:14). But how? Through Scripture (He never contradicts His Word), promptings, circumstances, counsel, and peace.

Leading isn''t always dramatic; often it''s quiet conviction or gentle direction. Today we grow in sensitivity to His leading.',
day6_context = 'Day 5 explored guidance. Today we examine the Spirit and prayer—He helps us pray.

"The Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us" (Romans 8:26). When words fail, He prays.

Spirit-led prayer follows His prompts, prays Scripture, and rests in His intercession. Today we pray in the Spirit.',
day7_context = 'Day 6 explored prayer. Today we examine the Spirit and Scripture—He illuminates truth.

"The Spirit will guide you into all the truth" (John 16:13). The Spirit who inspired Scripture also illuminates it. He opens minds to understand.

Spirit-led reading asks for His help, expects Him to teach, and responds to what He reveals. Today we read with Spirit-reliance.',
day8_context = 'Day 7 explored Scripture illumination. Today we examine the Spirit and witness—He empowers testimony.

"You will receive power when the Holy Spirit comes on you; and you will be my witnesses" (Acts 1:8). Boldness, words, effectiveness—all Spirit-provided.

Spirit-led witness follows His prompts, speaks His words, and trusts Him with results. Today we witness in Spirit-power.',
day9_context = 'Day 8 explored witness. Today we examine the Spirit and community—He distributes gifts for the body.

"There are different kinds of gifts, but the same Spirit distributes them... for the common good" (1 Corinthians 12:4, 7). Every believer is gifted; every gift serves others.

Spirit-led community uses gifts for blessing, not showing off. Today we discover and deploy our gifts.',
day10_context = 'Day 9 explored gifts. Today we examine walking in the Spirit—moment-by-moment dependence.

"Walk by the Spirit, and you will not gratify the desires of the flesh" (Galatians 5:16). Walking implies: ongoing movement, each step dependent, consistent direction.

Spirit-walking is daily, hourly awareness and dependence. Today we practice Spirit-walking.',
day11_context = 'Day 10 explored walking. Today we address not grieving the Spirit—He can be hurt.

"Do not grieve the Holy Spirit of God" (Ephesians 4:30). The context mentions: lying, anger, stealing, unwholesome talk, bitterness, rage. These grieve Him.

The Spirit is a Person who feels. Our sin hurts Him. Today we commit to not grieving our Guest.',
day12_context = 'Day 11 addressed grieving. Today we examine not quenching the Spirit—letting Him work.

"Do not quench the Spirit" (1 Thessalonians 5:19). The image is fire—we can suppress what He wants to do. Quenching resists His promptings.

Spirit-led living allows Him freedom, follows His prompts, and welcomes His work. Today we stop quenching.',
day13_context = 'Day 12 addressed quenching. Today we examine being filled with the Spirit—ongoing experience.

"Be filled with the Spirit" (Ephesians 5:18). The command is continuous: keep being filled. This isn''t one-time but ongoing.

Filling involves: surrender, confession, invitation, and faith. Today we seek fresh filling.',
day14_context = 'We''ve explored Spirit-led living: His presence, fruit, sanctification, guidance, prayer, Scripture, witness, community, walking, grieving, quenching, and filling.

"Since we live by the Spirit, let us keep in step with the Spirit" (Galatians 5:25).

As you complete this study, how will you follow the Spirit more closely? He indwells you. Walk with Him.'
WHERE slug = 'living-spirit-led';

-- Also fix some other common slug issues
-- Gospel in the OT
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'gospel-in-ot-14' LIMIT 1)
WHERE slug = 'gospel-in-old-testament' AND day5_context IS NULL;

-- Joshua
UPDATE public.reading_plans  
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'joshua-14-days' LIMIT 1)
WHERE slug = 'joshua-conquering-fear' AND day5_context IS NULL;

-- Judges
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'judges-14-days' LIMIT 1)  
WHERE slug = 'judges-rebellion-grace' AND day5_context IS NULL;

-- Solomon
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'solomon-14-days' LIMIT 1)
WHERE slug = 'solomon-wisdom-warning' AND day5_context IS NULL;

-- Minor Prophets
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'minor-prophets-14' LIMIT 1)
WHERE slug = 'minor-prophets-simple' AND day5_context IS NULL;

-- Sermon on Mount  
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'sermon-on-mount-14' LIMIT 1)
WHERE slug = 'sermon-on-mount' AND day5_context IS NULL;

-- Character of God
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'character-of-god-14' LIMIT 1)
WHERE slug = 'character-of-god' AND day5_context IS NULL;

-- Covenants
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'covenants-14' LIMIT 1)
WHERE slug = 'covenants-of-bible' AND day5_context IS NULL;

-- Kingdom of God  
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'kingdom-of-god-14' LIMIT 1)
WHERE slug = 'kingdom-of-god' AND day5_context IS NULL;

-- Holiness
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'holiness-14-days' LIMIT 1)
WHERE slug = 'holiness-broken-world' AND day5_context IS NULL;

-- Pray Like Jesus
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'pray-like-jesus-14' LIMIT 1)
WHERE slug = 'pray-like-jesus' AND day5_context IS NULL;

-- Renewing Your Mind
UPDATE public.reading_plans
SET day5_context = (SELECT day5_context FROM public.reading_plans WHERE slug = 'renewing-your-mind-14' LIMIT 1)
WHERE slug = 'renewing-your-mind' AND day5_context IS NULL;

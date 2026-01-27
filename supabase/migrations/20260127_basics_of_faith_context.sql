-- Basics of Faith - Rich Educational Context
-- Date: 2026-01-27
-- Essential teachings for new believers and those exploring Christianity

-- Update plan description
UPDATE public.reading_plans 
SET description = 'New to the Bible or Christianity? Start here. This 14-day plan covers the essential foundations of faith: who God is, who Jesus is, what salvation means, and how to grow spiritually.'
WHERE slug = 'basics-of-faith-14';

-- Day 1: God Created Everything
UPDATE public.reading_plan_days 
SET context = 'The Bible opens with the most fundamental truth: "In the beginning, God created the heavens and the earth." Before anything else existed, God was. He didn''t emerge from something—He is the eternal, uncreated Creator of everything.

Genesis 1 shows God creating by His word: "And God said... and it was so." The universe isn''t an accident. Stars, planets, oceans, and mountains all came from the intentional, powerful speech of God.

Psalm 19 tells us creation reveals God''s character: "The heavens declare the glory of God; the skies proclaim the work of his hands." When you look at a sunset, a mountain range, or a starry sky, you''re seeing God''s artwork—His power, creativity, and attention to detail on display.

This matters for several reasons:

First, you''re not an accident. The same God who carefully designed galaxies carefully designed you. Every aspect of creation—from DNA to ecosystems—shows intelligent, purposeful design.

Second, God is separate from creation. He''s not "in" everything like a force. He''s the transcendent Creator who made everything but isn''t identical with what He made. This is different from many other worldviews.

Third, creation is good. God looked at what He made and called it "good" repeatedly, and "very good" at the end. The physical world isn''t evil or inferior—it''s God''s good creation.

The Bible begins here because everything else depends on this foundation. If God created everything, He has authority over everything. If He designed us, He knows how we''re meant to live. Understanding God as Creator is the first step in understanding everything else.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 1;

-- Day 2: Humans & Sin
UPDATE public.reading_plan_days 
SET context = 'Genesis 3 records the moment everything went wrong. Adam and Eve, living in perfect relationship with God, chose to disobey the one prohibition He gave them. The serpent''s temptation was subtle: "Did God really say...?" Doubt about God''s word led to doubt about God''s character, which led to disobedience.

The consequences were immediate and catastrophic. Shame entered the world—they hid from God. Death entered the world—spiritual death (separation from God) immediately, physical death eventually. The ground was cursed. Pain in childbirth. Toil in work. The perfect world was fractured.

This is called "the Fall"—humanity fell from the position of innocence and blessing God intended.

Romans 3:23 summarizes our situation: "All have sinned and fall short of the glory of God." This isn''t just about Adam—it''s about everyone since. We''ve all chosen our own way over God''s way. We''ve all rebelled in thought, word, and deed.

Romans 6:23 states the consequence: "The wages of sin is death." This isn''t arbitrary punishment—it''s natural consequence. Sin separates us from the source of life. Cut off from God, we die spiritually now and physically eventually.

Understanding sin isn''t meant to depress you—it''s meant to show you why you need a Savior. A doctor doesn''t diagnose cancer to make you feel bad; they diagnose it so you''ll accept treatment.

The good news is that Romans 6:23 continues: "but the gift of God is eternal life in Christ Jesus our Lord." The diagnosis is serious. The cure is available. That''s where this journey is heading.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 2;

-- Day 3: God's Love
UPDATE public.reading_plan_days 
SET context = 'Given what we just learned about sin, you might expect God to abandon humanity. We rebelled against Him. We chose our own way. We brought death and suffering into His good creation. Why would He care about us?

The answer is simple and profound: God is love.

John 3:16 is the most famous verse in the Bible: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." Notice: God loved the world that had rejected Him. He gave His most precious gift—His Son—for rebels.

Romans 5:8 drives this home: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us." Not after we cleaned up our act. Not because we deserved it. While we were still enemies, God moved to save us.

1 John 4:9-10 explains what love truly is: "This is how God showed his love among us: He sent his one and only Son into the world that we might live through him. This is love: not that we loved God, but that he loved us and sent his Son as an atoning sacrifice for our sins."

God''s love isn''t just warm feelings—it''s costly action. He saw our desperate condition and did something about it at infinite cost to Himself.

Many people believe God is angry, distant, or disappointed. The Bible says He loves you so much that He gave everything to rescue you. You don''t need to earn this love or deserve it. It''s already yours—the question is whether you''ll receive it.

The Creator who spoke galaxies into existence looks at you and says, "I love you. I gave My Son for you. Come home."'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 3;

-- Day 4: Who is Jesus?
UPDATE public.reading_plan_days 
SET context = 'Jesus is the central figure of Christianity—but who exactly is He?

John 1:1-14 makes staggering claims. "In the beginning was the Word, and the Word was with God, and the Word was God." The "Word" refers to Jesus. John is saying Jesus existed before creation, was in relationship with God, and was Himself God.

Then: "The Word became flesh and made his dwelling among us." God didn''t send a messenger or an angel. He came Himself. Jesus is God in human flesh.

Colossians 1:15-20 expands this: Jesus is "the image of the invisible God"—if you want to know what God is like, look at Jesus. He is "the firstborn over all creation"—not created first, but holding first place. "By him all things were created"—Jesus made everything. "In him all things hold together"—He sustains the universe right now. "God was pleased to have all his fullness dwell in him"—Jesus isn''t partly God; He''s fully God.

This is called the Incarnation: the eternal Son of God took on human nature. He was born as a baby, grew as a child, worked as a carpenter. He got hungry, tired, and sad. He was fully human.

But He never stopped being fully divine. One person, two natures: human and divine.

Why does this matter? Because only someone who is fully God could bear the weight of humanity''s sin. And only someone who is fully human could die in our place.

Jesus isn''t just a great teacher or moral example (though He''s both). He''s God come to rescue us. C.S. Lewis said it well: Jesus claimed to be God. He was either a liar, a lunatic, or He was telling the truth. He doesn''t leave us the option of calling Him merely a "good teacher."'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 4;

-- Day 5: Jesus' Life & Ministry
UPDATE public.reading_plan_days 
SET context = 'What did Jesus actually do during His time on earth?

Luke 4 records Jesus launching His public ministry in His hometown synagogue. He reads from Isaiah: "The Spirit of the Lord is on me, because he has anointed me to proclaim good news to the poor. He has sent me to proclaim freedom for the prisoners and recovery of sight for the blind, to set the oppressed free, to proclaim the year of the Lord''s favor."

Then He says: "Today this scripture is fulfilled in your hearing." Jesus is claiming to be the long-awaited Messiah Isaiah prophesied.

Matthew 9:35-38 summarizes His ministry: "Jesus went through all the towns and villages, teaching in their synagogues, proclaiming the good news of the kingdom and healing every disease and sickness."

Three things stand out:

First, Jesus taught with authority. He explained the Scriptures, revealed God''s character, and showed people how to live. His teaching was unlike the religious leaders of His day—people recognized divine authority in His words.

Second, Jesus proclaimed the kingdom. His message was that God''s rule was breaking into the world through Him. The kingdom wasn''t just future—it was arriving in the present wherever Jesus was.

Third, Jesus healed and delivered. He gave sight to the blind, made the lame walk, cleansed lepers, cast out demons, and even raised the dead. These miracles weren''t just displays of power—they were previews of the fully restored world God will one day bring.

Jesus saw the crowds and "had compassion on them, because they were harassed and helpless, like sheep without a shepherd." He still sees, still has compassion, still invites harassed and helpless people to come to Him.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 5;

-- Day 6: The Cross
UPDATE public.reading_plan_days 
SET context = 'Why did Jesus die? This is Christianity''s central question.

Isaiah 53, written 700 years before Christ, provides the answer: "Surely he took up our pain and bore our suffering... he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed."

Jesus died as our substitute. The punishment we deserved fell on Him. Our sins were placed on Him. His righteousness is offered to us.

1 Peter 2:24 confirms this: "He himself bore our sins in his body on the cross, so that we might die to sins and live for righteousness; by his wounds you have been healed."

Think about what happened at the cross:
- The sinless Son of God took on the sins of the world
- He experienced the wrath of God against sin that we deserved
- He paid the penalty of death that our rebellion had earned
- He opened the way for guilty sinners to be forgiven and reconciled to God

The cross isn''t an afterthought or Plan B. It was God''s plan from the beginning. Jesus is "the Lamb who was slain from the creation of the world" (Revelation 13:8).

Many people misunderstand the cross. They think God the Father was angry while Jesus was loving. But the cross was the Father''s idea (John 3:16—"God so loved... that he gave"). The Trinity worked together for our salvation.

The cross shows us the seriousness of sin—it cost God His Son. It shows us the depth of God''s love—He paid that cost willingly. And it shows us the way home—through Jesus'' sacrifice, we can be forgiven.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 6;

-- Day 7: The Resurrection
UPDATE public.reading_plan_days 
SET context = 'If Jesus had stayed dead, Christianity would have died with Him. But three days after His crucifixion, the tomb was empty. Jesus was alive.

1 Corinthians 15:3-8 records the earliest Christian testimony: "Christ died for our sins according to the Scriptures... he was buried... he was raised on the third day according to the Scriptures, and... appeared to Cephas, and then to the Twelve. After that, he appeared to more than five hundred of the brothers and sisters at the same time."

Paul is listing eyewitnesses—many still alive when he wrote this. He''s inviting fact-checking.

Romans 10:9 makes the resurrection central to salvation: "If you declare with your mouth, ''Jesus is Lord,'' and believe in your heart that God raised him from the dead, you will be saved."

Why is the resurrection so important?

First, it proves Jesus is who He claimed to be. Anyone can claim to be God''s Son. Rising from the dead validates the claim.

Second, it shows that Jesus'' sacrifice was accepted. The Father raised the Son as a receipt, proving the debt was paid.

Third, it defeats death. "Where, O death, is your victory? Where, O death, is your sting?" Death isn''t the end for those in Christ—it''s a doorway.

Fourth, it guarantees our resurrection. "Because I live, you also will live," Jesus promised. His resurrection is the "firstfruits" of all who will rise (1 Corinthians 15:20).

The resurrection is the most well-attested fact of ancient history. The disciples saw Him. They touched Him. They ate with Him. And they died proclaiming His resurrection, when a simple denial would have saved their lives.

Jesus is alive. That changes everything.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 7;

-- Day 8: Salvation by Grace
UPDATE public.reading_plan_days 
SET context = 'How do you get saved? This is the question that matters most.

Ephesians 2:1-10 gives the answer. It starts with our condition: "You were dead in your transgressions and sins." Not sick, not struggling—dead. Dead people can''t save themselves.

Then it describes God''s response: "But because of his great love for us, God, who is rich in mercy, made us alive with Christ even when we were dead in transgressions."

The key word is grace: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast."

Grace means undeserved favor. You can''t earn it, achieve it, or deserve it. It''s a gift.

Faith is how you receive the gift. Faith isn''t a work—it''s an empty hand receiving what God offers. You don''t contribute anything except your need.

"Not by works, so that no one can boast." Salvation isn''t a reward for good behavior. It''s a rescue for people who can''t save themselves.

This is radically different from every other religion. Other systems say: do these things and you''ll be accepted. Christianity says: you''re accepted, now live in response to that acceptance.

Some worry: if salvation is free, won''t people abuse it? Paul anticipated this: "For we are God''s handiwork, created in Christ Jesus to do good works." Grace doesn''t lead to laziness—it empowers transformation. But the transformation comes after salvation, not before. And it''s the result of grace, not the cause of it.

You can''t be good enough. You don''t have to be. Jesus was good enough for you.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 8;

-- Day 9: New Life in Christ
UPDATE public.reading_plan_days 
SET context = 'What happens when you trust in Jesus? You become a completely new person.

2 Corinthians 5:17 says it plainly: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"

You''re not just forgiven—you''re transformed. The old you, dead in sin, is replaced by a new you, alive in Christ. This isn''t self-improvement or behavior modification. It''s recreation.

Romans 6:1-14 explains what this means for daily life. "We were therefore buried with him through baptism into death in order that, just as Christ was raised from the dead through the glory of the Father, we too may live a new life."

When Christ died, you died with Him (spiritually). When Christ rose, you rose with Him (spiritually). The power of sin was broken. You''re no longer a slave to your old nature.

"Do not offer any part of yourself to sin as an instrument of wickedness, but rather offer yourselves to God as those who have been brought from death to life."

This doesn''t mean Christians never sin. But it means sin is no longer our master. We have power to say no. We have the Holy Spirit enabling us. The old patterns can be broken.

Some people experience dramatic, immediate change when they trust Christ. Others experience gradual transformation. Both are normal. The key is direction, not perfection.

You will still struggle. You will still fail at times. But you''re no longer defined by your failures. You''re defined by Christ''s success. And He who began a good work in you will carry it on to completion (Philippians 1:6).'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 9;

-- Day 10: The Holy Spirit
UPDATE public.reading_plan_days 
SET context = 'The Christian life isn''t about trying harder to be good. It''s about relying on Someone who lives inside you—the Holy Spirit.

In John 14:15-27, Jesus promises not to leave His disciples alone. "I will ask the Father, and he will give you another advocate to help you and be with you forever—the Spirit of truth."

The Holy Spirit is not an impersonal force—He''s a Person, the third member of the Trinity. Jesus calls Him "another advocate"—the same Greek word used for Jesus Himself. The Spirit continues Jesus'' work in and through believers.

"The world cannot accept him, because it neither sees him nor knows him. But you know him, for he lives with you and will be in you." The Spirit''s presence inside believers is what makes Christianity unique. God doesn''t just teach us from outside—He transforms us from within.

Acts 2:1-4 records the Spirit''s coming at Pentecost. With violent wind and tongues of fire, the Spirit filled the believers, empowering them to speak in languages they''d never learned. The church was born that day—not through human planning but through divine power.

What does the Spirit do?
- He convicts us of sin (John 16:8)
- He guides us into truth (John 16:13)
- He empowers us for witness (Acts 1:8)
- He produces character change (Galatians 5:22-23)
- He gives spiritual gifts (1 Corinthians 12:4-11)
- He prays for us when we can''t find words (Romans 8:26)

You''re not alone. The same Spirit who raised Jesus from the dead lives in you. The Christian life is supernatural—and you have supernatural help.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 10;

-- Day 11: The Church
UPDATE public.reading_plan_days 
SET context = 'Christianity isn''t a solo journey. When you trust Christ, you join a family—the Church.

Acts 2:42-47 describes the first church: "They devoted themselves to the apostles'' teaching and to fellowship, to the breaking of bread and to prayer... All the believers were together and had everything in common... Every day they continued to meet together in the temple courts. They broke bread in their homes and ate together with glad and sincere hearts."

Notice what they did together: learned (apostles'' teaching), connected (fellowship), worshipped (breaking bread—the Lord''s Supper), prayed, shared meals, and shared possessions. Faith was expressed in community.

1 Corinthians 12:12-27 compares the Church to a body. "Just as a body, though one, has many parts, but all its many parts form one body, so it is with Christ." Every believer is necessary. No one can say "I don''t need the others." The eye can''t say to the hand, "I don''t need you."

You have gifts the body needs. You have needs others'' gifts can meet. Isolation leads to weakness; connection leads to strength.

Church isn''t a building you go to—it''s a family you belong to. You''ll find imperfect people there (including yourself). You''ll experience conflict and disappointment sometimes. But you''ll also find encouragement, accountability, teaching, and love.

Hebrews 10:25 warns against "giving up meeting together, as some are in the habit of doing, but encouraging one another—and all the more as you see the Day approaching."

Find a church that teaches the Bible, worships Jesus, and loves each other. Commit to it. Serve in it. Let others serve you. You weren''t meant to follow Jesus alone.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 11;

-- Day 12: Prayer
UPDATE public.reading_plan_days 
SET context = 'Prayer is simply talking to God—and it''s one of the most remarkable privileges you have as His child.

In Matthew 6:5-15, Jesus teaches His disciples how to pray. He warns against showing off ("when you pray, do not be like the hypocrites") and against empty repetition ("do not keep on babbling like pagans"). God isn''t impressed by eloquent words or long prayers. He wants genuine conversation.

Then Jesus gives a model: "Our Father in heaven"—prayer begins with relationship. God isn''t a distant deity but a loving Father. "Hallowed be your name"—we honor God''s character. "Your kingdom come, your will be done"—we align ourselves with God''s purposes. "Give us today our daily bread"—we bring our needs. "Forgive us our debts, as we also have forgiven our debtors"—we confess sin and extend grace. "Lead us not into temptation, but deliver us from the evil one"—we ask for protection.

Philippians 4:6-7 expands this: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."

Every situation. Every worry. Every need. Bring it to God.

Prayer changes things—sometimes circumstances, always us. When we pray, we acknowledge our dependence on God. We shift from self-reliance to trust. We experience His presence.

You don''t need special words or positions. You can pray anywhere, anytime, about anything. God hears. God cares. God answers—sometimes yes, sometimes no, sometimes wait, but always according to His perfect wisdom and love.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 12;

-- Day 13: The Bible
UPDATE public.reading_plan_days 
SET context = 'The Bible is God''s Word to humanity—and it''s essential for spiritual growth.

2 Timothy 3:16-17 explains its nature and purpose: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work."

"God-breathed" means the Bible isn''t just human thoughts about God—it''s God''s communication through human authors. The Holy Spirit guided the writers so that what they wrote is what God wanted said.

The Bible teaches—it tells us truth about God, ourselves, and the world. It rebukes—it shows us where we''re wrong. It corrects—it redirects us to the right path. It trains—it shapes our character over time. The result is being "thoroughly equipped"—ready for whatever God calls us to.

Psalm 119:105 describes Scripture as "a lamp for my feet, a light on my path." In a dark world, the Bible shows us where to walk. It doesn''t answer every question, but it guides our steps in the right direction.

How should you approach the Bible?

Read it regularly. Daily time in Scripture shapes you gradually but powerfully. Start with a Gospel (Mark is shortest) and work through it.

Read it prayerfully. Ask the Spirit to help you understand and apply what you read.

Read it expectantly. God speaks through His Word. Come expecting to hear from Him.

Read it obediently. The goal isn''t just knowledge but transformation. Do what it says.

The Bible isn''t a magic book—but God uses it powerfully. As you read, you''ll encounter God Himself speaking to you.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 13;

-- Day 14: Living for Jesus
UPDATE public.reading_plan_days 
SET context = 'You''ve learned the foundations: God created you, sin separated you from God, Jesus died and rose to save you, grace is how you receive salvation, the Spirit empowers your new life, the church supports your growth, prayer and Scripture connect you to God.

Now what? You live for Jesus.

Matthew 28:18-20 gives the mission: "All authority in heaven and on earth has been given to me. Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you."

You''re called to make disciples—helping others follow Jesus. This isn''t just for pastors or missionaries. It''s for every believer. Start with your family, friends, neighbors, coworkers.

Micah 6:8 summarizes how to live: "He has shown you, O mortal, what is good. And what does the LORD require of you? To act justly and to love mercy and to walk humbly with your God."

Act justly—do what''s right, even when it costs you.
Love mercy—show kindness to those who don''t deserve it (just as God did for you).
Walk humbly—stay dependent on God, not proud of your achievements.

The Christian life isn''t about following rules; it''s about following Jesus. He''s not just Savior—He''s Lord. Every area of life comes under His authority: your relationships, work, finances, entertainment, ambitions.

This doesn''t mean perfection—it means direction. You''ll fail. You''ll stumble. But you keep following. You keep trusting. You keep growing.

"And surely I am with you always, to the very end of the age." You''re not alone. Jesus is with you, for you, and in you through His Spirit. The journey has just begun.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'basics-of-faith-14') 
AND day_number = 14;

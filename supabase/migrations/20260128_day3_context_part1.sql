-- Day 3 Context for Reading Plans - Part 1
-- Date: 2026-01-28

-- First, add the day3_context column if it doesn't exist
ALTER TABLE public.reading_plans 
ADD COLUMN IF NOT EXISTS day3_context TEXT;

-- ============================================
-- FOUNDATIONAL PLANS - Day 3
-- ============================================

-- Basics of Faith 14 Days
UPDATE public.reading_plans
SET day3_context = 'The previous two days established God''s existence and character. Today we examine another foundational truth: the Bible is God''s reliable Word to us.

The Bible claims to be "God-breathed" (2 Timothy 3:16)—originating from God Himself. This doesn''t mean dictation but divine superintendence: the Holy Spirit guided human authors so that what they wrote was exactly what God intended, while their personalities and styles remained evident.

But how do we know this claim is true? Several lines of evidence converge: The Bible''s remarkable unity—66 books by 40+ authors over 1,500 years telling one cohesive story. Its historical reliability—archaeology repeatedly confirms biblical details. Its fulfilled prophecy—predictions made centuries before their fulfillment. Its transformative power—millions testify to changed lives. Its endurance—surviving every attempt to destroy or discredit it.

The ultimate confirmation is the Spirit''s witness. "The Spirit himself testifies with our spirit" (Romans 8:16). As we read Scripture, the Spirit confirms its truth to our hearts. This isn''t blind faith but Spirit-enabled recognition.

Today we receive the Bible as God''s authoritative Word—our foundation for everything we believe and how we live.'
WHERE slug = 'basics-of-faith-14';

-- 7 Day Faith Reset
UPDATE public.reading_plans
SET day3_context = 'Day 1 recognized our need for reset. Day 2 explored who God is. Today we examine who we are: created in God''s image but fallen into sin.

"God created mankind in his own image" (Genesis 1:27). This is our dignity—we reflect God, possess rationality, make moral choices, create beauty, and have capacity for relationship. No other creature bears God''s image. We have inherent worth and purpose.

But Genesis 3 records the fall. Adam and Eve chose independence from God, and we''ve inherited their rebellion. "All have sinned and fall short of the glory of God" (Romans 3:23). We''re not sinners because we sin; we sin because we''re sinners—our nature is corrupted.

This creates an honest anthropology: we''re capable of both great good (image-bearing) and terrible evil (fallenness). We''re not basically good people who occasionally slip, nor totally depraved with no good remaining. We''re a complex mixture—glorious ruins.

Understanding this prevents two errors: pride (thinking we don''t need a Savior) and despair (thinking we''re worthless). We need rescue, but we''re worth rescuing. God thinks so—He sent His Son.

Today we hold together both truths: our dignity as image-bearers and our need as sinners.'
WHERE slug = '7-day-faith-reset';

-- 21 Day Renewal
UPDATE public.reading_plans
SET day3_context = 'Day 1 began our renewal journey. Day 2 emphasized Scripture''s central role. Today we explore prayer—the essential complement to Bible reading.

Scripture is God speaking to us; prayer is us speaking to God. Together they create conversation. Reading without praying produces information without transformation. Praying without reading produces emotion without direction. We need both.

"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God" (Philippians 4:6). Prayer is meant to encompass everything—"in every situation." No concern is too small, no problem too big.

Many struggle with prayer because they approach it as performance. Am I saying the right words? Is this prayer good enough? But prayer is conversation with a Father who loves us. Children don''t worry about eloquence when talking to parents; neither should we.

Simple prayer beats no prayer. "Lord, help me" is valid prayer. So is "I don''t know what to pray, but here I am." The Spirit even helps: "The Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us" (Romans 8:26).

Today we commit to pray—imperfectly, simply, honestly—trusting that God welcomes our words.'
WHERE slug = '21-day-renewal';

-- 30 Day Walk with Jesus
UPDATE public.reading_plans
SET day3_context = 'Day 1 began our month with Jesus. Day 2 established His deity. Today we examine the complementary truth: Jesus is fully human.

"The Word became flesh and made his dwelling among us" (John 1:14). The eternal Son took on human nature—not appearing human or pretending to be human but actually becoming human while remaining divine.

Jesus experienced authentic human life. He was hungry (Matthew 4:2), thirsty (John 19:28), tired (John 4:6), and sorrowful (Matthew 26:38). He grew "in wisdom and stature" (Luke 2:52)—genuine development, not simulation. He was "tempted in every way, just as we are—yet he did not sin" (Hebrews 4:15).

Why does His humanity matter? Several reasons: It enables Him to be our substitute—a human to die for humans. It enables Him to be our High Priest—one who sympathizes with our weakness because He experienced it. It enables Him to be our example—showing what human life can be when fully surrendered to God.

The incarnation means God understands our experience from the inside. When we pray, we address one who has walked our road, felt our pain, faced our temptations. He''s not distant but intimately acquainted with human life.

Today we worship Jesus—fully God, fully man, the perfect bridge between heaven and earth.'
WHERE slug = '30-day-walk-jesus';

-- 90 Day New Believer
UPDATE public.reading_plans
SET day3_context = 'Day 1 celebrated your new birth. Day 2 explored what happened when you believed. Today we discuss how you grow: spiritual disciplines aren''t optional extras but essential practices.

Spiritual disciplines are habits that position us for God''s transforming work. They don''t earn God''s favor—that''s already secured in Christ. But they create space for grace to shape us.

Bible reading feeds your soul: "Like newborn babies, crave pure spiritual milk, so that by it you may grow up in your salvation" (1 Peter 2:2). Start with a Gospel—Mark is short and action-packed. Read a little daily rather than a lot sporadically.

Prayer connects you to God. It doesn''t have to be formal. Talk to God throughout the day—thank Him for good things, ask for help with challenges, confess when you fail.

Church fellowship provides community: "Let us not giving up meeting together, as some are in the habit of doing, but encouraging one another" (Hebrews 10:25). You need other believers, and they need you. Christianity isn''t solo.

Service gives purpose. Every believer has gifts to contribute. Find ways to serve—not to earn anything but to express the new life within you.

Today we establish these foundational practices that will sustain growth for a lifetime.'
WHERE slug = '90-day-new-believer';

-- What is Salvation
UPDATE public.reading_plans
SET day3_context = 'Day 1 introduced salvation''s necessity. Day 2 examined sin''s problem. Today we explore salvation''s solution: grace through faith in Jesus Christ.

"For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast" (Ephesians 2:8-9).

Grace means undeserved favor. We don''t earn salvation; we receive it as gift. Every religion except Christianity tells people to do something to reach God. Christianity says God has done everything to reach us.

Faith is the means by which we receive grace. It''s not intellectual agreement alone but trust—banking our eternal destiny on Christ. "Believe in the Lord Jesus, and you will be saved" (Acts 16:31).

This faith produces works: "For we are God''s handiwork, created in Christ Jesus to do good works" (Ephesians 2:10). We''re not saved by works, but we''re saved for works. Good deeds don''t produce salvation; salvation produces good deeds.

Jesus is the object of saving faith. "Salvation is found in no one else, for there is no other name under heaven given to mankind by which we must be saved" (Acts 4:12). Not religion in general but Jesus specifically.

Today we rest in grace, exercise faith, and prepare for the works we''re created to do.'
WHERE slug = 'what-is-salvation';

-- Gospel in the Old Testament
UPDATE public.reading_plans
SET day3_context = 'Day 1 introduced finding the gospel throughout the Old Testament. Day 2 examined the first gospel promise in Genesis 3:15. Today we explore the pattern of sacrifice established in Genesis and developed throughout Scripture.

After the fall, Adam and Eve tried to cover their shame with fig leaves—their own effort to address their problem. But "the LORD God made garments of skin for Adam and his wife and clothed them" (Genesis 3:21). God provided covering, but it required death. An animal died so they could be clothed.

This pattern established something fundamental: sin requires death. When Cain and Abel brought offerings, God accepted Abel''s animal sacrifice but rejected Cain''s produce (Genesis 4:4-5). The difference wasn''t arbitrary—blood was required.

Abraham was prepared to sacrifice Isaac, his promised son, when God provided a ram instead (Genesis 22). "Abraham looked up and there in a thicket he saw a ram caught by its horns. He went over and took the ram and sacrificed it as a burnt offering instead of his son" (22:13). Substitution—one dying in place of another.

The Passover lamb''s blood on doorposts saved Israel''s firstborn from death (Exodus 12). The Levitical system formalized sacrifice as the way to approach holy God.

All these sacrifices pointed to "the Lamb of God, who takes away the sin of the world" (John 1:29). Today we trace the scarlet thread of sacrifice through Scripture.'
WHERE slug = 'gospel-in-old-testament';

-- Why Jesus Had to Die
UPDATE public.reading_plans
SET day3_context = 'Day 1 introduced the question of why Jesus had to die. Day 2 examined the Old Testament sacrificial background. Today we explore the theological meaning: propitiation—satisfying God''s wrath against sin.

"God presented Christ as a sacrifice of atonement, through the shedding of his blood" (Romans 3:25). The word "atonement" translates hilasterion—propitiation. It means turning away wrath through an acceptable sacrifice.

This concept offends modern sensibilities. We prefer to think of God as pure love, uncomfortable with wrath. But love without justice isn''t love—it''s indifference to evil. A judge who never punishes criminals doesn''t love victims.

God''s wrath is His settled opposition to evil, His righteous response to sin. "The wrath of God is being revealed from heaven against all the godlessness and wickedness of people" (Romans 1:18). This isn''t capricious anger but principled justice.

The cross satisfies this wrath. Jesus bore God''s judgment against sin so we wouldn''t have to. "He himself bore our sins in his body on the cross" (1 Peter 2:24). The punishment we deserved fell on Him.

This displays both God''s justice (sin is punished) and His love (He takes the punishment Himself). "God demonstrates his own love for us in this: While we were still sinners, Christ died for us" (Romans 5:8).

Today we worship the God who is both just and justifier—who punished sin fully while pardoning sinners freely.'
WHERE slug = 'why-jesus-had-to-die';

-- Resurrection Power
UPDATE public.reading_plans
SET day3_context = 'Day 1 introduced the resurrection''s centrality. Day 2 examined the historical evidence. Today we explore what the resurrection means for us—it''s not just past event but present power.

"I want to know Christ—yes, to know the power of his resurrection" (Philippians 3:10). Paul wasn''t seeking mere information about the resurrection but experience of its power in his daily life.

What power is this? "That power is the same as the mighty strength he exerted when he raised Christ from the dead" (Ephesians 1:19-20). The power that conquered death is now available to believers.

This power enables new life now. "We were therefore buried with him through baptism into death in order that, just as Christ was raised from the dead through the glory of the Father, we too may live a new life" (Romans 6:4). Resurrection power isn''t only future—it transforms how we live today.

It enables victory over sin. "The body ruled by the Spirit is life and peace... And if the Spirit of him who raised Jesus from the dead is living in you, he who raised Christ from the dead will also give life to your mortal bodies because of his Spirit who lives in you" (Romans 8:6, 11).

The resurrection proves Jesus'' identity, guarantees our future resurrection, and provides present power for godly living. Today we access resurrection power through the Spirit who raised Jesus.'
WHERE slug = 'resurrection-power';

-- Messianic Prophecies Fulfilled
UPDATE public.reading_plans
SET day3_context = 'Day 1 introduced Messianic prophecy. Day 2 traced the Messiah''s lineage through Abraham, Judah, and David. Today we examine prophecies about His birth and early life.

Micah, writing around 700 BC, pinpointed Bethlehem: "But you, Bethlehem Ephrathah, though you are small among the clans of Judah, out of you will come for me one who will be ruler over Israel, whose origins are from of old, from ancient times" (Micah 5:2). Seven centuries later, Jesus was born in Bethlehem—not where Mary and Joseph lived (Nazareth) but where a Roman census brought them.

Isaiah, also around 700 BC, predicted a virgin birth: "The virgin will conceive and give birth to a son, and will call him Immanuel" (Isaiah 7:14). "Immanuel" means "God with us"—a hint of the incarnation centuries before it happened.

Hosea, writing around 750 BC, provided a detail Matthew quotes: "Out of Egypt I called my son" (Hosea 11:1). The flight to Egypt to escape Herod, then the return after Herod''s death, fulfilled this pattern (Matthew 2:15).

Jeremiah predicted the massacre of innocents: "A voice is heard in Ramah, weeping and great mourning" (Jeremiah 31:15). Herod''s slaughter of Bethlehem''s boys echoed this ancient prophecy (Matthew 2:18).

These weren''t vague predictions but specific details—birthplace, manner of birth, geography, surrounding events. Today we marvel at God''s precise orchestration across centuries.'
WHERE slug = 'messianic-prophecies-fulfilled';

-- Genesis to Jesus
UPDATE public.reading_plans
SET day3_context = 'Day 1 introduced tracing redemption from Genesis to Jesus. Day 2 examined the Abrahamic covenant. Today we explore Joseph''s story as a preview of Christ.

Joseph''s life foreshadows Jesus remarkably. Both were beloved sons of their fathers. Both were envied and hated by brothers. Both were sold for silver (Joseph for 20 pieces, Jesus for 30). Both were falsely accused. Both suffered though innocent.

But the parallels continue in redemption. Joseph was raised from the pit (symbolic death) to Pharaoh''s right hand. He became the source of salvation for the very brothers who betrayed him. "You intended to harm me, but God intended it for good to accomplish what is now being done, the saving of many lives" (Genesis 50:20).

Jesus was raised from actual death to God''s right hand. He became the source of salvation for the very people who crucified Him. What humans intended for evil—the worst crime in history—God used for the greatest good.

Joseph revealed himself to his brothers who didn''t recognize him: "I am Joseph!" (Genesis 45:3). Zechariah prophesied that Israel would one day recognize Jesus: "They will look on me, the one they have pierced, and they will mourn for him" (Zechariah 12:10).

Joseph''s story isn''t just biography but prophecy enacted. Today we see Christ in Joseph and marvel at God''s creative foreshadowing.'
WHERE slug = 'genesis-to-jesus';

-- Life of Jesus Chronological
UPDATE public.reading_plans
SET day3_context = 'Day 1 introduced our chronological journey through Jesus'' life. Day 2 examined the world He entered and Gabriel''s announcement to Mary. Today we witness the birth—the moment when "the Word became flesh."

Caesar Augustus decreed a census, unknowingly fulfilling Micah''s prophecy that the Messiah would be born in Bethlehem. Joseph and Mary traveled from Nazareth while Mary was "pledged to be married to him and was expecting a child" (Luke 2:5).

"While they were there, the time came for the baby to be born, and she gave birth to her firstborn, a son. She wrapped him in cloths and placed him in a manger, because there was no guest room available for them" (Luke 2:6-7).

The Creator of the universe entered His creation as a helpless infant, born to poor parents, placed in an animal''s feeding trough. No palace, no fanfare, no recognition from the world''s powers. The King came incognito.

Angels announced His birth—but to shepherds, not kings. "Do not be afraid. I bring you good news that will cause great joy for all the people. Today in the town of David a Savior has been born to you; he is the Messiah, the Lord" (Luke 2:10-11).

The shepherds found Mary, Joseph, and the baby, just as the angels said. "The shepherds returned, glorifying and praising God" (2:20). Today we join their worship at the manger.'
WHERE slug = 'life-of-jesus-chronological';

-- How We Got the Bible
UPDATE public.reading_plans
SET day3_context = 'Day 1 introduced the Bible''s origins. Day 2 examined inspiration—how God and human authors collaborated. Today we explore canonization—how the church recognized which books belong in Scripture.

"Canon" comes from a Greek word meaning "measuring rod" or "standard." The biblical canon is the collection of books recognized as God''s authoritative Word.

Importantly, the church didn''t create the canon; it recognized it. The books were already authoritative because God inspired them; the church''s task was discerning which books those were.

For the Old Testament, Jesus affirmed the Hebrew Scriptures used in His day—the same books (though differently arranged) as our Old Testament. He referred to "the Law of Moses, the Prophets and the Psalms" (Luke 24:44), the three-part Jewish division.

For the New Testament, several criteria guided recognition: Apostolic origin (written by an apostle or close associate). Orthodox content (consistent with apostolic teaching). Universal acceptance (recognized by churches across regions). Transformative power (God working through the text).

The core books were recognized quickly. Debates existed about some books on the margins, but the church reached consensus by the fourth century. The 27 New Testament books we have weren''t imposed by councils but recognized as the books Christians had always valued.

Today we receive the canon as God''s completed revelation—sufficient for faith and practice.'
WHERE slug = 'how-we-got-the-bible';

-- Teachings of Jesus
UPDATE public.reading_plans
SET day3_context = 'Day 1 introduced Jesus as Master Teacher. Day 2 examined His parable method. Today we explore the "I AM" statements in John''s Gospel—Jesus'' bold self-declarations.

In Exodus, God revealed His name to Moses: "I AM WHO I AM" (3:14). When Jesus used "I AM" with predicates, He claimed divine identity and revealed aspects of His mission.

"I am the bread of life" (John 6:35)—Jesus satisfies spiritual hunger. As bread sustains physical life, Jesus sustains eternal life. He''s what we truly need.

"I am the light of the world" (8:12)—Jesus provides guidance and exposes truth. Following Him, we don''t walk in darkness but have "the light of life."

"I am the gate" (10:9)—Jesus is the entrance to salvation. Through Him we enter and "find pasture."

"I am the good shepherd" (10:11)—Jesus knows His sheep, cares for them, and lays down His life for them.

"I am the resurrection and the life" (11:25)—Jesus has power over death. Believing in Him means living forever.

"I am the way and the truth and the life" (14:6)—Jesus is the exclusive path to the Father.

"I am the true vine" (15:1)—Jesus is the source of spiritual life. Connected to Him, we bear fruit.

These aren''t humble claims but staggering declarations. Today we receive Jesus as He presents Himself—not just teacher but Bread, Light, Gate, Shepherd, Resurrection, Way, and Vine.'
WHERE slug = 'teachings-of-jesus';

-- Bible in a Year
UPDATE public.reading_plans
SET day3_context = 'Day 1 began your Bible-in-a-year journey. Day 2 offered practical guidance. Today we discuss approaching challenging passages—because some of what you''ll read will be difficult.

You''ll encounter violence commanded by God, laws that seem harsh, prophecies that confuse, and passages where faithful interpreters disagree. How should you approach these?

First, keep reading. Don''t let a difficult passage stop your progress. Mark it, note your questions, but move forward. Often context gained later illuminates earlier puzzles.

Second, distinguish between "difficult to understand" and "difficult to accept." Some passages are unclear because we lack historical context or language nuances. Others are clear but challenging to our assumptions. These require different responses.

Third, trust God''s character. When a passage seems to contradict what we know of God''s goodness, we may be misunderstanding the passage, lacking context, or needing theological growth. God doesn''t change; our understanding develops.

Fourth, use resources. A good study Bible, commentaries, or discussions with mature believers can illuminate difficult texts. You don''t have to figure everything out alone.

Fifth, embrace mystery. We''re finite creatures understanding an infinite God''s Word. Some things remain beyond our current comprehension. That''s okay.

Today we commit to keep reading through difficulties, trusting the God who inspired every word.'
WHERE slug = 'bible-in-a-year';

-- One Year Bible Overview
UPDATE public.reading_plans
SET day3_context = 'Day 1 introduced the Bible''s grand narrative. Day 2 examined creation''s theology. Today we confront the fall—the catastrophe that explains everything wrong with the world.

Genesis 3 is history''s hinge. The serpent approached Eve with a question: "Did God really say...?" (3:1). Notice the strategy: not outright denial but insinuation of doubt. He misquoted God, adding "you must not touch it." Then he denied consequences: "You will not certainly die." Finally he impugned God''s motives: "God knows that when you eat...your eyes will be opened."

Eve saw the fruit was "good for food, pleasing to the eye, and desirable for gaining wisdom" (3:6). The temptation targeted appetite, aesthetics, and ambition—the same patterns that tempt us still. She took, ate, and gave to Adam.

Immediately their eyes were opened—not to become like God but to know shame. They hid from each other and from God. When confronted, they blamed: Adam blamed Eve, Eve blamed the serpent.

The consequences cascaded: pain, conflict, cursed ground, death. They were expelled from Eden, prevented from eating from the tree of life and living forever in their fallen state.

Yet even in judgment, grace appeared. God clothed them (first sacrifice) and promised the serpent-crusher (first gospel). Today we face the fall honestly while glimpsing redemption''s dawn.'
WHERE slug = 'one-year-bible-overview';

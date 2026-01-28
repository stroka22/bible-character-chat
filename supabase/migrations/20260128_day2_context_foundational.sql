-- Day 2 Context for Foundational Reading Plans
-- Date: 2026-01-28

-- First, add the day2_context column if it doesn't exist
ALTER TABLE public.reading_plans 
ADD COLUMN IF NOT EXISTS day2_context TEXT;

-- ============================================
-- FOUNDATIONAL PLANS - Day 2
-- ============================================

-- Basics of Faith 14 Days
UPDATE public.reading_plans
SET day2_context = 'Yesterday we explored why foundational truths matter. Today we examine the first and most fundamental: God exists. This isn''t blind faith but reasonable belief supported by evidence all around us.

The Bible doesn''t argue for God''s existence—it assumes it: "In the beginning God..." (Genesis 1:1). Yet Scripture acknowledges that creation itself testifies to the Creator: "The heavens declare the glory of God; the skies proclaim the work of his hands" (Psalm 19:1). Paul wrote that God''s "invisible qualities—his eternal power and divine nature—have been clearly seen, being understood from what has been made" (Romans 1:20).

Philosophers call this "natural revelation"—truth about God available to all people through creation and conscience. The intricate design of DNA, the fine-tuning of universal constants, the existence of objective morality, the human longing for meaning—all point beyond themselves to a Creator. Today''s reading explores these signposts and what they reveal about the God who made them.'
WHERE slug = 'basics-of-faith-14';

-- 7 Day Faith Reset
UPDATE public.reading_plans
SET day2_context = 'Yesterday we recognized the need for returning to basics. Today we focus on the most basic truth: who God is. Everything else in Christianity flows from our understanding of God''s character.

A.W. Tozer wrote, "What comes into our minds when we think about God is the most important thing about us." If we think God is distant, we won''t pray. If we think He''s harsh, we''ll hide from Him. If we think He''s indifferent, we''ll despair. Right thinking about God produces right living.

Today we explore God''s core attributes: He is holy (completely pure and set apart), loving (giving Himself for our good), just (always doing right), merciful (withholding deserved punishment), faithful (keeping every promise), and sovereign (in control of all things). These aren''t abstract concepts but practical realities that shape how we face each day. The God who is really there is better than we imagine.'
WHERE slug = '7-day-faith-reset';

-- 21 Day Renewal
UPDATE public.reading_plans
SET day2_context = 'Yesterday we began our renewal journey. Today we examine the foundation of all spiritual growth: the Word of God. No discipline is more essential than regular engagement with Scripture.

The Bible isn''t merely a religious book but "living and active, sharper than any double-edged sword" (Hebrews 4:12). It''s God''s primary means of speaking to us, transforming us, and equipping us for every good work. Jesus said, "Man shall not live on bread alone, but on every word that comes from the mouth of God" (Matthew 4:4).

Yet many Christians struggle with Bible reading—it feels like duty, comprehension is difficult, or life crowds it out. Today we explore why Scripture is essential and how to engage it fruitfully. The goal isn''t information transfer but transformation. We read not to check a box but to meet the living God who speaks through His written Word. What would change if you approached the Bible expecting to hear from God?'
WHERE slug = '21-day-renewal';

-- 30 Day Walk with Jesus
UPDATE public.reading_plans
SET day2_context = 'Yesterday we began our month with Jesus. Today we examine a foundational truth: Jesus is fully God. This isn''t a doctrine the church invented later—it''s what Jesus Himself claimed and what His earliest followers believed.

Jesus accepted worship (Matthew 14:33), forgave sins (Mark 2:5-7), claimed eternal existence (John 8:58), and declared "I and the Father are one" (John 10:30). His Jewish opponents understood exactly what He meant—they picked up stones to kill Him for blasphemy, "because you, a mere man, claim to be God" (John 10:33).

The disciples came to the same conclusion. Thomas, confronting the risen Christ, exclaimed "My Lord and my God!" (John 20:28). John''s Gospel opens by declaring Jesus was "with God" and "was God" from the beginning (John 1:1). Paul called Him "our great God and Savior" (Titus 2:13). If Jesus is merely a good teacher or prophet, Christianity crumbles. But if He is God incarnate, everything changes.'
WHERE slug = '30-day-walk-jesus';

-- 90 Day New Believer
UPDATE public.reading_plans
SET day2_context = 'Yesterday we celebrated your new life in Christ. Today we explore what actually happened when you believed. Understanding your salvation helps you stand firm when doubts arise.

When you trusted Christ, several things happened simultaneously. You were justified—declared righteous before God, not because of your merit but because Christ''s righteousness was credited to your account (Romans 4:5). You were redeemed—bought back from slavery to sin by Christ''s blood (Ephesians 1:7). You were reconciled—brought from enmity with God into peace with Him (Romans 5:10). You were adopted—welcomed into God''s family as a son or daughter with full inheritance rights (Galatians 4:5).

These aren''t future possibilities but present realities. You don''t need to earn them—they''re already yours in Christ. Today''s reading explores each of these truths, helping you understand and appreciate what God accomplished on your behalf. Your feelings will fluctuate, but these facts remain constant.'
WHERE slug = '90-day-new-believer';

-- What is Salvation
UPDATE public.reading_plans
SET day2_context = 'Yesterday we introduced the concept of salvation—rescue from sin and its consequences. Today we explore humanity''s problem that makes salvation necessary: we are sinners who cannot save ourselves.

Sin isn''t just "bad behavior" but fundamental rebellion against God. Adam and Eve didn''t merely break a rule about fruit—they declared independence from their Creator, deciding for themselves what was good and evil. Every human since has followed their pattern: "All have sinned and fall short of the glory of God" (Romans 3:23).

Sin''s consequences are devastating. It separates us from God (Isaiah 59:2), enslaves us (John 8:34), corrupts our nature (Jeremiah 17:9), and ultimately brings death (Romans 6:23). We''re not sinners because we sin; we sin because we''re sinners—born with a nature inclined toward self rather than God. This diagnosis sounds harsh, but it''s essential. We can''t appreciate the cure until we understand the disease. Today we face the bad news that makes the good news so good.'
WHERE slug = 'what-is-salvation';

-- Gospel in the Old Testament
UPDATE public.reading_plans
SET day2_context = 'Yesterday we saw that the gospel wasn''t invented in the New Testament but revealed progressively from Genesis onward. Today we examine the first gospel promise, given in the darkest moment of human history.

Adam and Eve had just sinned. They hid from God, made excuses, and blamed each other. Everything was broken. But when God pronounced judgment, He embedded a promise within the curse on the serpent: "I will put enmity between you and the woman, and between your offspring and hers; he will crush your head, and you will strike his heel" (Genesis 3:15).

This is the "protoevangelium"—the first gospel announcement. Someone born of a woman would defeat the serpent, though at great cost to Himself (a "heel strike" versus a "head crush"). The rest of the Old Testament gradually reveals who this serpent-crusher would be. Today we explore this foundational promise and trace its echoes through subsequent Scripture. The story of redemption begins in Genesis 3—and it points straight to Christ.'
WHERE slug = 'gospel-in-old-testament';

-- Why Jesus Had to Die
UPDATE public.reading_plans
SET day2_context = 'Yesterday we introduced the question of why Jesus had to die. Today we examine the Old Testament background that makes the cross meaningful: the sacrificial system.

From Abel''s offering through the elaborate Levitical system, blood sacrifice was central to relating to God. "Without the shedding of blood there is no forgiveness" (Hebrews 9:22). The annual Day of Atonement required two goats: one killed as a sin offering, the other sent into the wilderness bearing the people''s sins (Leviticus 16).

These sacrifices were never ultimately effective—they had to be repeated endlessly, "an annual reminder of sins" (Hebrews 10:3). But they taught essential truths: sin is serious (it requires death), substitution is possible (an innocent can die in place of the guilty), and God provides the sacrifice (Abraham told Isaac, "God himself will provide the lamb").

Every lamb that died pointed forward to "the Lamb of God, who takes away the sin of the world" (John 1:29). Today we explore this sacrificial background that gives the cross its meaning.'
WHERE slug = 'why-jesus-had-to-die';

-- Resurrection Power
UPDATE public.reading_plans
SET day2_context = 'Yesterday we introduced the resurrection as Christianity''s cornerstone. Today we examine the historical evidence that Jesus actually rose from the dead.

The resurrection isn''t a "spiritual" event we accept by blind faith—it''s a historical claim that can be examined. Consider the evidence: The tomb was empty (even opponents admitted this, inventing the "disciples stole the body" story). Multiple eyewitnesses saw the risen Christ—over 500 at once, according to Paul (1 Corinthians 15:6), most still alive when he wrote. The disciples were transformed from fearful deserters into bold proclaimers willing to die for their testimony.

The resurrection also explains Christianity''s existence. Something happened to launch this movement. The disciples didn''t expect resurrection—they were shocked and initially doubtful. Their transformation requires explanation. As N.T. Wright argues, the empty tomb plus the resurrection appearances together provide the best historical explanation for the evidence.

If Jesus rose, He is who He claimed to be, and His promises are trustworthy. Today we examine the evidence and its implications.'
WHERE slug = 'resurrection-power';

-- Messianic Prophecies Fulfilled
UPDATE public.reading_plans
SET day2_context = 'Yesterday we introduced the remarkable phenomenon of Messianic prophecy. Today we begin examining specific predictions, starting with the Messiah''s lineage.

The narrowing process began immediately after the fall. The serpent-crusher would come through Eve''s offspring—not the serpent''s. Then the line narrowed to Shem''s descendants (Genesis 9:26), then to Abraham''s family (Genesis 12:3), then to Isaac (not Ishmael), then to Jacob (not Esau), then to Judah (not his eleven brothers): "The scepter will not depart from Judah... until he to whom it belongs shall come" (Genesis 49:10).

Later prophecies specified David''s line (2 Samuel 7:12-16; Isaiah 11:1). Matthew and Luke both trace Jesus'' genealogy through David and Judah back to Abraham—different routes but the same destination. Mary''s song celebrated that God was fulfilling "the promise he made to our ancestors, to Abraham and his descendants forever" (Luke 1:55).

The probability of one person fulfilling even these genealogical requirements by chance is infinitesimal. Today we trace this narrowing lineage that pointed to one specific family, tribe, and throne.'
WHERE slug = 'messianic-prophecies-fulfilled';

-- Genesis to Jesus
UPDATE public.reading_plans
SET day2_context = 'Yesterday we began tracing redemption''s thread from creation. Today we examine the covenant with Abraham—God''s foundational promise that shapes everything afterward.

Abram was a pagan idol-worshiper in Ur when God called him. The promise was stunning: "I will make you into a great nation, and I will bless you... and all peoples on earth will be blessed through you" (Genesis 12:2-3). Notice the scope—not just Abraham, not just Israel, but "all peoples on earth."

This covenant was formalized dramatically. God had Abraham cut animals in half and arrange them in rows—the ancient way of making binding agreements. Normally, both parties would walk between the pieces, symbolizing "may this be done to me if I break this covenant." But Abraham fell into deep sleep, and God alone passed through as a smoking firepot and blazing torch (Genesis 15).

The meaning is profound: God was taking the covenant obligations entirely upon Himself. If the covenant failed, God would pay the price. At the cross, He did. Today we explore this foundational covenant and its cosmic implications.'
WHERE slug = 'genesis-to-jesus';

-- Life of Jesus Chronological
UPDATE public.reading_plans
SET day2_context = 'Yesterday we began our chronological journey through Jesus'' life. Today we examine the context into which He was born—the world was ready, though it didn''t know it.

"When the set time had fully come, God sent his Son" (Galatians 4:4). The timing was precise. The Roman Empire had unified the Mediterranean world, providing roads for travel and a common trade language (Greek). The Pax Romana brought relative peace. Jewish synagogues dotted the empire, introducing Gentiles to monotheism and messianic expectation.

Yet Israel groaned under Roman occupation. The Herods were puppet kings. Tax collectors extracted wealth for Rome. Religious leaders collaborated with oppressors. Four hundred years had passed since the last prophet—God seemed silent.

Into this world of political oppression, religious corruption, and desperate hope, a teenage girl in an obscure village received an angelic visitor. Today we explore the world Jesus entered and the announcement that changed everything: "You will conceive and give birth to a son, and you are to call him Jesus" (Luke 1:31).'
WHERE slug = 'life-of-jesus-chronological';

-- How We Got the Bible
UPDATE public.reading_plans
SET day2_context = 'Yesterday we introduced the Bible''s origin. Today we examine the remarkable process of inspiration—how God used human authors to produce His Word.

Inspiration doesn''t mean God dictated while humans transcribed like robots. The authors'' personalities, vocabularies, and styles are evident throughout Scripture. Luke researched carefully (Luke 1:1-4). Paul expressed personal frustration (Galatians 3:1). Jeremiah wept over Jerusalem. Yet these human expressions were "God-breathed" (2 Timothy 3:16)—the Spirit superintended the process so that what they wrote was exactly what God intended.

Peter explained: "Prophets, though human, spoke from God as they were carried along by the Holy Spirit" (2 Peter 1:21). The Spirit didn''t override their personalities but worked through them. Like wind filling a sail, the Spirit moved the authors while they remained active participants.

The result is a book that is fully human and fully divine—much like Jesus Himself. Today we explore how God and human authors cooperated to produce Scripture that is authoritative, truthful, and transformative.'
WHERE slug = 'how-we-got-the-bible';

-- Teachings of Jesus
UPDATE public.reading_plans
SET day2_context = 'Yesterday we introduced Jesus as the Master Teacher. Today we examine His primary teaching method: parables. About one-third of Jesus'' recorded teaching comes in these memorable stories.

A parable is an earthly story with a heavenly meaning. Jesus drew from everyday life—farming, fishing, weddings, business dealings—to reveal spiritual truth. The familiar settings made parables memorable and accessible to common people, while their depth rewarded repeated reflection.

But parables also concealed truth from the merely curious. When disciples asked why He taught this way, Jesus quoted Isaiah: "Though seeing, they do not see; though hearing, they do not hear or understand" (Matthew 13:13). Parables reveal to seekers and hide from scoffers.

Many parables ended without explicit interpretation, forcing listeners to engage and draw conclusions. "He who has ears, let him hear," Jesus often concluded. Today we explore Jesus'' parable method and several key examples, learning to hear what Jesus was teaching about God, His kingdom, and how we should live.'
WHERE slug = 'teachings-of-jesus';

-- Bible in a Year
UPDATE public.reading_plans
SET day2_context = 'Yesterday you began the journey of reading through the entire Bible. Today, some practical guidance for sustaining this year-long commitment.

Consistency matters more than catching up. If you miss a day, simply continue with the current reading rather than trying to double up. The goal isn''t checking boxes but encountering God. Better to read steadily throughout the year than burn out in February trying to make up missed days.

Vary your approach to maintain freshness. Some days, read slowly and meditate on a phrase. Other days, read quickly to see the big picture. Journal occasionally—write a sentence about what struck you. Pray the passages back to God.

Don''t expect every chapter to be equally exciting. Levitical laws and genealogies have their place in Scripture''s story. Push through slower sections knowing that understanding the whole Bible enriches your reading of every part. The prophets make more sense after reading the history they address. The epistles make more sense after reading the Gospels.

Today''s reading continues laying the foundation. Each day builds on what came before.'
WHERE slug = 'bible-in-a-year';

-- One Year Bible Overview
UPDATE public.reading_plans
SET day2_context = 'Yesterday we introduced the Bible''s grand narrative. Today we look at the opening act: creation. Understanding how the story begins shapes how we read everything after.

Genesis 1-2 isn''t primarily a scientific text but a theological statement. It answers "who" and "why" more than "how" and "when." The God who exists before all things speaks the universe into being. Unlike ancient Near Eastern creation myths where gods battled chaos, Israel''s God effortlessly commands: "Let there be light."

Creation reaches its climax with humanity. God doesn''t speak us into being but forms us, breathes into us, makes us in His image. We are God''s representatives, given dominion and purpose. The repeated refrain "it was good" reaches its crescendo: "very good."

This original goodness matters. The world isn''t inherently evil—it''s fallen from something beautiful. Salvation isn''t escape from creation but its restoration. Today we explore creation''s theology and its implications for understanding human dignity, environmental stewardship, and ultimate hope.'
WHERE slug = 'one-year-bible-overview';

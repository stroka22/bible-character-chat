-- Day 4 Context for Reading Plans - Part 1
-- Date: 2026-01-28

-- First, add the day4_context column if it doesn't exist
ALTER TABLE public.reading_plans 
ADD COLUMN IF NOT EXISTS day4_context TEXT;

-- ============================================
-- FOUNDATIONAL PLANS - Day 4
-- ============================================

-- Basics of Faith 14 Days
UPDATE public.reading_plans
SET day4_context = 'We''ve established God''s existence, character, and the Bible''s authority. Today we examine humanity''s problem: sin separates us from God.

Sin isn''t just bad behavior but fundamental rebellion. Adam and Eve didn''t merely break a rule; they declared independence from their Creator. Every human has followed their pattern: "All have sinned and fall short of the glory of God" (Romans 3:23).

The effects are devastating. Sin separates us from God: "Your iniquities have separated you from your God" (Isaiah 59:2). Sin corrupts our nature: "The heart is deceitful above all things and beyond cure" (Jeremiah 17:9). Sin brings death: "The wages of sin is death" (Romans 6:23).

We can''t fix this ourselves. Self-improvement can''t address the core problem—we''re not just bad; we''re dead in sin (Ephesians 2:1). Dead people can''t revive themselves.

This diagnosis sounds harsh but is essential. Doctors who minimize disease do patients no favors. We must understand sin''s seriousness to appreciate salvation''s wonder.

The good news only sounds good against this bad news. Tomorrow we''ll explore God''s remedy. Today we face the reality: we''re sinners in desperate need of rescue.'
WHERE slug = 'basics-of-faith-14';

-- 7 Day Faith Reset
UPDATE public.reading_plans
SET day4_context = 'We''ve explored who God is and who we are. Today we examine what God has done: Jesus Christ came to rescue us.

"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life" (John 3:16). This is Christianity''s heart: God''s love moved Him to action. He didn''t observe our plight passively; He entered it.

Jesus lived the life we couldn''t live—perfectly obedient to the Father. He died the death we deserved—bearing sin''s penalty in our place. He rose victorious—conquering death and guaranteeing our resurrection.

"But God demonstrates his own love for us in this: While we were still sinners, Christ died for us" (Romans 5:8). God''s love isn''t response to our worthiness but its cause. He loved us at our worst.

This rescue is complete. Jesus said, "It is finished" (John 19:30)—not "to be continued" but complete. Nothing remains for us to add. We receive what He accomplished.

"For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God" (Ephesians 2:8). Salvation is gift, not achievement. We receive it through faith—trusting Christ, not ourselves.

Today we celebrate rescue: God has done what we couldn''t do. The reset begins here.'
WHERE slug = '7-day-faith-reset';

-- 21 Day Renewal
UPDATE public.reading_plans
SET day4_context = 'We''ve explored Scripture and prayer as renewal foundations. Today we examine worship—both corporate and personal.

"God is spirit, and his worshipers must worship in the Spirit and in truth" (John 4:24). Worship isn''t merely music or ritual but engaging God with our whole being. It''s Spirit-enabled and truth-directed.

Corporate worship matters. "Let us not giving up meeting together, as some are in the habit of doing, but encouraging one another" (Hebrews 10:25). Gathering with believers isn''t optional spirituality but essential Christianity. We need each other.

In corporate worship, we hear God''s Word preached, receive the sacraments, sing truth together, and experience the body of Christ. Something happens when believers gather that can''t happen alone.

Personal worship also matters. David resolved, "I will extol the LORD at all times; his praise will always be on my lips" (Psalm 34:1). Worship isn''t confined to Sunday but extends through the week. Driving, working, walking—any moment can become worship.

Worship shapes us. What we worship, we become like. Focusing regularly on God''s character transforms our character. "And we all, who with unveiled faces contemplate the Lord''s glory, are being transformed into his image" (2 Corinthians 3:18).

Today we evaluate our worship—both gathered and scattered. Is worship central or peripheral to our lives?'
WHERE slug = '21-day-renewal';

-- 30 Day Walk with Jesus
UPDATE public.reading_plans
SET day4_context = 'We''ve established Jesus'' full deity and full humanity. Today we examine His teachings—what did Jesus actually say about life in God''s kingdom?

Jesus'' central message was the kingdom of God. "The time has come... The kingdom of God has come near. Repent and believe the good news!" (Mark 1:15). Everything He taught related to this kingdom—its nature, its values, its demands.

Kingdom values invert worldly values. "Blessed are the meek, for they will inherit the earth" (Matthew 5:5). The world says blessed are the aggressive. "Blessed are the peacemakers" (5:9). The world admires the victors. Jesus'' kingdom operates differently.

Kingdom ethics go deeper than behavior to heart. "You have heard that it was said, ''You shall not murder.''... But I tell you that anyone who is angry with a brother or sister will be subject to judgment" (5:21-22). Jesus didn''t abolish the law but intensified it—addressing root causes, not just external actions.

Kingdom relationships transform how we treat enemies. "Love your enemies and pray for those who persecute you" (5:44). This is impossible without supernatural transformation.

Kingdom priorities reorder life. "But seek first his kingdom and his righteousness, and all these things will be given to you as well" (6:33). God first; everything else follows.

Today we let Jesus'' teachings challenge our assumptions. Is our life aligned with kingdom values or worldly ones?'
WHERE slug = '30-day-walk-jesus';

-- 90 Day New Believer
UPDATE public.reading_plans
SET day4_context = 'We''ve celebrated salvation and begun discussing disciplines. Today we address a crucial practice: gathering with other believers in church.

"They devoted themselves to the apostles'' teaching and to fellowship, to the breaking of bread and to prayer" (Acts 2:42). From the beginning, Christians gathered. Faith isn''t private spirituality but communal life.

Church isn''t a building but a people—the body of Christ. "Now you are the body of Christ, and each one of you is a part of it" (1 Corinthians 12:27). You''re not just a spectator but a member, with both privileges and responsibilities.

Why do we need church? For teaching—you need regular exposure to Scripture explained and applied. For accountability—others see blind spots you miss. For encouragement—we need voices reminding us of truth. For service—your gifts are meant for the body''s good.

Finding a church can feel daunting. Look for Scripture-based teaching, genuine community, gospel-centered worship, and opportunity to serve and grow. No church is perfect, but find one that values what Scripture values.

Commit to attendance even when you don''t feel like it. "Let us consider how we may spur one another on toward love and good deeds" (Hebrews 10:24). We can''t spur one another if we''re not present.

Today we thank God for the church and commit to active participation.'
WHERE slug = '90-day-new-believer';

-- What is Salvation
UPDATE public.reading_plans
SET day4_context = 'We''ve examined sin''s problem and grace''s solution. Today we explore what happens when someone believes—the transformation called conversion.

Conversion involves two responses: repentance and faith.

Repentance means turning—from sin and self-rule toward God. "Repent and be baptized, every one of you, in the name of Jesus Christ for the forgiveness of your sins" (Acts 2:38). It''s not just feeling sorry but changing direction. You were heading one way; now you''re heading another.

Faith means trusting—believing that Jesus is who He claimed and did what Scripture says, then banking your eternal destiny on Him. "Believe in the Lord Jesus, and you will be saved" (Acts 16:31). Faith isn''t just mental agreement but active trust.

These aren''t separate steps but two sides of one coin. You can''t turn to Christ without turning from sin. You can''t trust the Savior without distrusting your own efforts.

What happens at conversion? You''re born again—given new spiritual life (John 3:3). You''re justified—declared righteous before God (Romans 5:1). You''re adopted—made a child of God (Galatians 4:5). You''re sealed by the Spirit—guaranteed eternal security (Ephesians 1:13-14).

Have you turned and trusted? If not, today is the day. If so, thank God for conversion''s miracle—a dead person made alive, an enemy made family.'
WHERE slug = 'what-is-salvation';

-- Gospel in the Old Testament
UPDATE public.reading_plans
SET day4_context = 'We''ve seen the first gospel promise (Genesis 3:15) and the pattern of sacrifice. Today we examine the Passover—the pivotal Old Testament event that foreshadowed Christ most directly.

Israel was enslaved in Egypt. God sent plagues, but Pharaoh''s heart remained hard. The final plague would be devastating: death of every firstborn. But God provided protection.

"Tell the whole community of Israel that on the tenth day of this month each man is to take a lamb for his family" (Exodus 12:3). The lamb must be "without defect" (12:5). On the fourteenth day, they would slaughter it and "put some of the blood on the sides and tops of the doorframes of the houses" (12:7).

"When I see the blood, I will pass over you. No destructive plague will touch you when I strike Egypt" (12:13). The blood made the difference. Not the Israelites'' goodness—they were sinners too. The blood.

The lamb died so the firstborn wouldn''t. Substitution. Innocent dying in place of guilty. Death satisfied by another death.

John the Baptist saw Jesus and declared: "Look, the Lamb of God, who takes away the sin of the world!" (John 1:29). Jesus is the ultimate Passover Lamb. His blood on the doorframes of our hearts causes God''s judgment to pass over.

"Christ, our Passover lamb, has been sacrificed" (1 Corinthians 5:7). Today we worship the Lamb whose blood saves.'
WHERE slug = 'gospel-in-old-testament';

-- Why Jesus Had to Die
UPDATE public.reading_plans
SET day4_context = 'We''ve examined sacrifice and propitiation. Today we explore another dimension of the cross: redemption—purchasing freedom for those enslaved.

"In him we have redemption through his blood, the forgiveness of sins" (Ephesians 1:7). Redemption is market language—buying back something, paying a ransom to secure release. The imagery comes from slave markets and hostage situations.

We were enslaved—to sin, to Satan, to death. "Everyone who sins is a slave to sin" (John 8:34). Addiction, compulsion, inability to change—these are symptoms of slavery. We couldn''t free ourselves.

Jesus paid the ransom. "For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many" (Mark 10:45). His life was the payment; His death purchased our freedom.

To whom was the ransom paid? Not to Satan—he had no rightful claim. The ransom language emphasizes cost and liberation more than recipient. What matters is that the price was paid and we''re free.

"It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery" (Galatians 5:1). We''re free—from sin''s penalty (justification), from sin''s power (sanctification), and eventually from sin''s presence (glorification).

Today we celebrate freedom purchased at infinite cost. The Son has set us free; we''re free indeed.'
WHERE slug = 'why-jesus-had-to-die';

-- Resurrection Power
UPDATE public.reading_plans
SET day4_context = 'We''ve established the resurrection''s historical reality and present power. Today we examine its future promise: our own resurrection.

"For since death came through a man, the resurrection of the dead comes also through a man. For as in Adam all die, so in Christ all will be made alive" (1 Corinthians 15:21-22). Adam brought death; Christ brings resurrection. What Adam broke, Christ fixes.

Our resurrection will be bodily. "So will it be with the resurrection of the dead. The body that is sown is perishable, it is raised imperishable" (15:42). Not disembodied spirits but transformed bodies. Continuous with our current bodies yet gloriously different.

"For the trumpet will sound, the dead will be raised imperishable, and we will be changed. For the perishable must clothe itself with the imperishable, and the mortal with immortality" (15:52-53). This is our hope: immortality, imperishability, glorious transformation.

Jesus'' resurrection is "firstfruits"—the first portion of a harvest that guarantees more to come. "But Christ has indeed been raised from the dead, the firstfruits of those who have fallen asleep" (15:20). His resurrection guarantees ours.

This transforms how we face death. "Where, O death, is your victory? Where, O death, is your sting?" (15:55). Death is real but not final. It''s an enemy, but a defeated one.

Today we face mortality with resurrection hope. The worst chapter isn''t the final chapter.'
WHERE slug = 'resurrection-power';

-- Messianic Prophecies Fulfilled
UPDATE public.reading_plans
SET day4_context = 'We''ve traced the Messiah''s lineage and birth circumstances. Today we examine prophecies about His ministry—details predicted centuries before fulfilled.

Isaiah described the Messiah''s ministry region: "In the future he will honor Galilee of the nations, by the Way of the Sea, beyond the Jordan" (Isaiah 9:1). Jesus based His ministry in Galilee—not prestigious Jerusalem but despised Galilee.

Isaiah also described His ministry character: "The Spirit of the Lord will rest on him—the Spirit of wisdom and of understanding, the Spirit of counsel and of might, the Spirit of the knowledge and fear of the Lord" (Isaiah 11:2). Jesus was Spirit-filled from His baptism onward.

The ministry would include miracles: "Then will the eyes of the blind be opened and the ears of the deaf unstopped. Then will the lame leap like a deer, and the mute tongue shout for joy" (Isaiah 35:5-6). When John the Baptist sent messengers asking if Jesus was the Messiah, Jesus pointed to these very signs (Matthew 11:4-5).

His teaching method was predicted: "I will open my mouth with a parable; I will utter hidden things, things from of old" (Psalm 78:2). Matthew explicitly connects Jesus'' parables to this prophecy (Matthew 13:35).

These aren''t vague generalities but specific details—ministry location, character, activities, methods—all predicted and all fulfilled.

Today we marvel at God''s precise orchestration across centuries. What He predicts, He performs.'
WHERE slug = 'messianic-prophecies-fulfilled';

-- Genesis to Jesus
UPDATE public.reading_plans
SET day4_context = 'We''ve traced the Abrahamic covenant and seen Joseph as Christ-type. Today we examine Moses and the exodus—the Old Testament''s central redemption event.

God called Moses to deliver Israel from slavery. The story includes plagues, Passover, and dramatic escape through the Red Sea. But beyond the historical event, Moses foreshadowed Christ.

Moses was rescued from death as an infant (the Nile), as Jesus was (escaping Herod). Moses left palace privilege for solidarity with his people, as Christ left heaven''s glory for humanity. Moses was mediator between God and Israel, as Christ mediates between God and us.

Moses prophesied about Jesus: "The LORD your God will raise up for you a prophet like me from among you, from your fellow Israelites. You must listen to him" (Deuteronomy 18:15). A prophet like Moses—speaking God''s words, leading God''s people, mediating God''s covenant—would come.

The exodus itself previewed salvation. Israel was enslaved; we were enslaved to sin. Deliverance came through blood (Passover lamb); our deliverance comes through Christ''s blood. They passed through water (Red Sea); we pass through baptism. They journeyed toward a promised land; we journey toward heaven.

Paul makes the connection: "Christ, our Passover lamb, has been sacrificed" (1 Corinthians 5:7). The exodus wasn''t just history but prophecy enacted.

Today we see Christ in Moses and exodus—anticipations of greater deliverance.'
WHERE slug = 'genesis-to-jesus';

-- Life of Jesus Chronological
UPDATE public.reading_plans
SET day4_context = 'We''ve witnessed Jesus'' birth and infancy. Today we examine His childhood—the mostly hidden years when the Son of God grew up.

Luke gives us the only Gospel glimpse of Jesus between infancy and adult ministry: the temple visit at age twelve. His family traveled to Jerusalem for Passover. Returning home, Mary and Joseph realized Jesus wasn''t with their group.

After three days of searching, they found Him "in the temple courts, sitting among the teachers, listening to them and asking them questions. Everyone who heard him was amazed at his understanding and his answers" (Luke 2:46-47).

Mary scolded Him: "Son, why have you treated us like this?" Jesus'' response was remarkable: "Didn''t you know I had to be in my Father''s house?" (2:49). At twelve, He knew His identity and mission—"my Father."

Yet "he went down to Nazareth with them and was obedient to them" (2:51). The Son of God submitted to human parents. He could have claimed divine privilege; instead, He embraced human process.

"Jesus grew in wisdom and stature, and in favor with God and man" (2:52). Genuine development—intellectual, physical, spiritual, social. He didn''t bypass normal human growth but experienced it fully.

For roughly eighteen more years, Jesus lived in obscurity—working as a carpenter, learning Torah, waiting for His hour. Today we appreciate the hidden years that prepared for public ministry.'
WHERE slug = 'life-of-jesus-chronological';

-- How We Got the Bible
UPDATE public.reading_plans
SET day4_context = 'We''ve examined inspiration and canonization. Today we explore transmission—how the Bible was copied and preserved across centuries.

Before printing, Scripture was copied by hand. This raises questions: how reliable are our copies? Did errors creep in?

The New Testament has extraordinary manuscript support. Over 5,800 Greek manuscripts exist—far more than any other ancient document. The earliest fragments date within decades of the originals. We can compare manuscripts across centuries and regions to identify copying errors.

The copying was remarkably accurate. Jewish scribes followed meticulous rules when copying the Old Testament. Christian scribes, while less formal, produced manuscripts we can compare to verify accuracy. Where variations exist (mostly minor spelling differences), comparison reveals the original.

No essential doctrine depends on disputed texts. The variations that exist don''t affect what we believe about God, Christ, salvation, or ethics. The message is unchanged despite minor transmission differences.

The Dead Sea Scrolls, discovered in 1947, dramatically confirmed Old Testament preservation. These manuscripts were 1,000 years older than previously known copies—yet remarkably similar. God preserved His Word through the copying process.

"The grass withers and the flowers fall, but the word of our God endures forever" (Isaiah 40:8). God didn''t just inspire Scripture; He preserved it.

Today we trust that the Bible we hold reliably transmits what God originally inspired.'
WHERE slug = 'how-we-got-the-bible';

-- Teachings of Jesus
UPDATE public.reading_plans
SET day4_context = 'We''ve examined Jesus'' parables and "I AM" statements. Today we explore His teaching on prayer—particularly the Lord''s Prayer.

When disciples asked Jesus to teach them to pray, He gave what we call the Lord''s Prayer (Matthew 6:9-13). It''s both a prayer to pray and a pattern for praying.

"Our Father in heaven, hallowed be your name." We address God as Father—intimate yet transcendent. "Hallowed" means honored as holy. We begin with reverence before requests.

"Your kingdom come, your will be done, on earth as it is in heaven." Kingdom priority precedes personal needs. We align ourselves with God''s agenda before presenting ours.

"Give us today our daily bread." Now we ask for physical needs—but daily, not stockpiled. Dependence remains constant.

"And forgive us our debts, as we also have forgiven our debtors." Vertical forgiveness connects to horizontal forgiveness. Receiving God''s mercy flows into extending mercy.

"And lead us not into temptation, but deliver us from the evil one." We acknowledge our weakness and need for protection. We can''t handle temptation alone.

The prayer is plural throughout—"our," "us," "we." Even private prayer is communal; we pray as part of a family.

Jesus also taught persistence (Luke 11:5-8), humility (Luke 18:9-14), and faith (Mark 11:24) in prayer.

Today we learn from the Master Teacher how to pray.'
WHERE slug = 'teachings-of-jesus';

-- Bible in a Year
UPDATE public.reading_plans
SET day4_context = 'You''re establishing the rhythm of daily Bible reading. Today we discuss meditation—going deeper than reading, letting Scripture transform you.

Reading gives breadth; meditation gives depth. Joshua was commanded: "Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it" (Joshua 1:8).

Meditation isn''t emptying the mind (Eastern meditation) but filling it with truth (biblical meditation). It''s sustained, focused, prayerful attention to Scripture.

How do you meditate? Read a passage slowly. Read it again, even slower. Ask questions: What does this reveal about God? About humanity? About myself? What response does it call for?

Personalize it. Insert your name. "The Lord is [your name]''s shepherd; [your name] shall not want." Let the truth become personal address.

Visualize it. If it''s narrative, imagine the scene. What do you see, hear, smell? Put yourself in the story.

Pray it. Turn the passage into conversation with God. "Lord, help me to trust that You are my shepherd."

Memorize key portions. What''s memorized can be meditated on anytime—commuting, waiting, exercising.

The goal isn''t information but transformation. "Do not merely listen to the word... Do what it says" (James 1:22). Meditation moves truth from head to heart to hands.

Today we slow down and meditate—letting Scripture soak in rather than just washing over.'
WHERE slug = 'bible-in-a-year';

-- One Year Bible Overview
UPDATE public.reading_plans
SET day4_context = 'We''ve covered creation and the fall. Today we encounter the flood—God''s judgment on a world corrupted by sin and His preservation of a remnant.

"The LORD saw how great the wickedness of the human race had become on the earth, and that every inclination of the thoughts of the human heart was only evil all the time" (Genesis 6:5). Sin had metastasized. Violence and corruption filled the earth.

"But Noah found favor in the eyes of the LORD" (6:8). Amid universal corruption, one man was righteous. God would preserve humanity through him.

God instructed Noah to build an ark and bring animals aboard. Then came the flood: "the springs of the great deep burst forth, and the floodgates of the heavens were opened" (7:11). Everything with the breath of life perished; only those in the ark survived.

The flood demonstrates God''s judgment on sin. He''s not indifferent to evil; He will act. Peter warns that the current world faces similar judgment: "By the same word the present heavens and earth are reserved for fire, being kept for the day of judgment" (2 Peter 3:7).

But the flood also demonstrates God''s salvation. The ark preserved Noah''s family through judgment. Peter calls it a picture of baptism (1 Peter 3:20-21)—passing through waters of judgment into new life.

Today we soberly acknowledge both God''s judgment and His provision for escape.'
WHERE slug = 'one-year-bible-overview';

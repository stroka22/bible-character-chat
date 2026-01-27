-- Romans for Everyday Christians & Book of Acts - Rich Educational Context
-- Date: 2026-01-27

-- ============================================
-- ROMANS FOR EVERYDAY CHRISTIANS
-- ============================================

UPDATE public.reading_plans 
SET description = 'Paul''s letter to the Romans is Christianity''s most complete explanation of the gospel. This 21-day plan makes this theological masterpiece accessible, showing how it applies to your everyday life.'
WHERE slug = 'romans-everyday';

-- Day 1: The Gospel of God
UPDATE public.reading_plan_days 
SET context = 'Paul opens Romans by introducing himself and his mission. He''s "a servant of Christ Jesus, called to be an apostle and set apart for the gospel of God."

Notice: it''s the "gospel of God"—not Paul''s invention, not a human philosophy, but good news from God Himself. This gospel was "promised beforehand through his prophets in the Holy Scriptures." It wasn''t new—it was the fulfillment of what God had been promising for centuries.

The gospel concerns "his Son, who as to his earthly life was a descendant of David, and who through the Spirit of holiness was appointed the Son of God in power by his resurrection from the dead: Jesus Christ our Lord."

Two things about Jesus: He came from David''s line (fulfilling Old Testament prophecy) and was declared Son of God by His resurrection. The resurrection proves everything.

Paul then shares his driving ambition: "Through him we received grace and apostleship to call all the Gentiles to the obedience that comes from faith for his name''s sake."

Finally, the thesis statement of Romans (1:16-17): "For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes: first to the Jew, then to the Gentile. For in the gospel the righteousness of God is revealed—a righteousness that is by faith from first to last."

The gospel isn''t just information—it''s power. It actually saves people. And it reveals how to be right with God: by faith. Not by works, not by religious rituals, not by ethnicity—by faith.

This letter will unpack what that means for every area of life.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'romans-everyday') 
AND day_number = 1;

-- Day 2: Everyone Needs the Gospel
UPDATE public.reading_plan_days 
SET context = 'Before Paul explains God''s solution, he establishes the problem. Romans 1:18-32 is dark—Paul describes humanity''s rebellion against God and its devastating consequences.

"The wrath of God is being revealed from heaven against all the godlessness and wickedness of people, who suppress the truth by their wickedness."

Humans don''t lack evidence for God—they suppress it. "Since the creation of the world God''s invisible qualities—his eternal power and divine nature—have been clearly seen, being understood from what has been made, so that people are without excuse."

The problem isn''t intellectual—it''s moral. People "knew God" but "neither glorified him as God nor gave thanks to him." They exchanged worship of the Creator for worship of created things.

"Therefore God gave them over..." This phrase appears three times. When people persist in rebellion, God eventually lets them experience the full consequences: degraded minds, shameful desires, a list of vices that describes much of human history.

This passage is hard to read. It''s meant to be. Paul wants us to feel the weight of human sin before he offers the remedy.

But notice: this isn''t just about "those terrible sinners over there." Chapter 2 will turn the tables on religious people who think they''re exempt. The point of Romans 1 isn''t to identify bad people—it''s to show that humanity as a whole has rejected God.

The gospel isn''t just for "really bad" people. It''s for everyone, because everyone needs it. That includes you and me.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'romans-everyday') 
AND day_number = 2;

-- Day 3: No One is Righteous
UPDATE public.reading_plan_days 
SET context = 'In Romans 2, Paul has been arguing that both Gentiles (who sin without the law) and Jews (who sin despite having the law) are guilty before God. Religious knowledge doesn''t save; in fact, it increases accountability.

Now, in Romans 3:9-20, Paul brings his case to its devastating conclusion: "What shall we conclude then? Do we have any advantage? Not at all! For we have already made the charge that Jews and Gentiles alike are all under the power of sin."

Then he quotes a string of Old Testament passages like a prosecutor presenting evidence:

"There is no one righteous, not even one; there is no one who understands; there is no one who seeks God. All have turned away, they have together become worthless; there is no one who does good, not even one."

The picture is complete moral failure. Not just in behavior—"Their throats are open graves; their tongues practice deceit"—but in orientation: "There is no fear of God before their eyes."

Why this brutal assessment? "So that every mouth may be silenced and the whole world held accountable to God."

We want to defend ourselves. We want to compare ourselves to worse people. We want to plead extenuating circumstances. Paul silences every defense.

"Therefore no one will be declared righteous in God''s sight by the works of the law; rather, through the law we become conscious of our sin."

The law is like a mirror—it shows us how dirty we are. But mirrors can''t clean you up. Only grace can do that.

The bad news is very bad. But Paul has been setting up the most glorious "but" in all of Scripture.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'romans-everyday') 
AND day_number = 3;

-- Day 4: Justified by Faith
UPDATE public.reading_plan_days 
SET context = 'After establishing that no one is righteous, Paul introduces the solution. These verses are the theological heart of Romans—and perhaps the whole Bible.

"But now apart from the law the righteousness of God has been made known... This righteousness is given through faith in Jesus Christ to all who believe."

How can guilty sinners be declared righteous? God provides a righteousness that comes through faith, not through law-keeping.

"All have sinned and fall short of the glory of God, and all are justified freely by his grace through the redemption that came by Christ Jesus."

"Justified" is a legal term—it means declared righteous, acquitted, not guilty. And it''s "freely"—we don''t pay for it. It''s "by his grace"—undeserved favor. It''s "through the redemption that came by Christ Jesus"—Jesus paid the price.

"God presented Christ as a sacrifice of atonement, through the shedding of his blood—to be received by faith."

"Sacrifice of atonement" (or "propitiation") means Jesus absorbed God''s wrath against sin. God didn''t ignore sin or pretend it didn''t happen. He dealt with it fully—in Jesus.

"This was to demonstrate his righteousness... so as to be just and the one who justifies those who have faith in Jesus."

Here''s the problem: How can a just God forgive guilty sinners without compromising His justice? Answer: by punishing sin fully in Jesus, God can be both just (sin is punished) and justifier (sinners go free).

"Where, then, is boasting? It is excluded... For we maintain that a person is justified by faith apart from the works of the law."

You can''t brag about receiving a gift. Salvation by faith humbles us completely—and that''s the point.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'romans-everyday') 
AND day_number = 4;

-- Day 10: No Condemnation
UPDATE public.reading_plan_days 
SET context = 'Romans 8 begins with one of the most liberating statements in Scripture: "Therefore, there is now no condemnation for those who are in Christ Jesus."

No condemnation. Not "less condemnation" or "condemnation if you mess up badly enough." None.

How is this possible? "Through Christ Jesus the law of the Spirit who gives life has set you free from the law of sin and death." A new law operates in believers—the Spirit gives life where sin brought death.

"For what the law was powerless to do because it was weakened by the flesh, God did by sending his own Son in the likeness of sinful flesh to be a sin offering."

The law told us what to do but couldn''t enable us to do it. Our sinful nature (flesh) made us powerless. So God did what we couldn''t—He dealt with sin through Jesus.

The result? "In order that the righteous requirement of the law might be fully met in us, who do not live according to the flesh but according to the Spirit."

Now we can actually live differently—not by trying harder, but by walking in the Spirit.

Paul contrasts two mindsets: "The mind governed by the flesh is death, but the mind governed by the Spirit is life and peace." What you focus on determines your experience.

"You, however, are not in the realm of the flesh but are in the realm of the Spirit, if indeed the Spirit of God lives in you."

If you''re a Christian, the Spirit lives in you. You''re in a new realm with new possibilities. The same Spirit "who raised Jesus from the dead" will give life to your mortal body.

You''re not condemned. You''re indwelt. You''re empowered. Live like it.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'romans-everyday') 
AND day_number = 10;

-- Day 14: More Than Conquerors
UPDATE public.reading_plan_days 
SET context = 'Romans 8:31-39 may be the most comforting passage in the Bible. Paul asks a series of rhetorical questions that crush every fear a believer might have.

"If God is for us, who can be against us?" Opposition will come—but if God is on your side, no opposition is ultimate. Enemies can hurt you but not defeat you.

"He who did not spare his own Son, but gave him up for us all—how will he not also, along with him, graciously give us all things?" If God gave His most precious gift (Jesus) for you when you were an enemy, why would He withhold good things from you now that you''re His child?

"Who will bring any charge against those whom God has chosen? It is God who justifies." Accusations come—from Satan, from others, from our own guilty conscience. But the Judge has declared us righteous. The case is closed.

"Who then is the one who condemns? No one. Christ Jesus who died—more than that, who was raised to life—is at the right hand of God and is also interceding for us."

Jesus isn''t in heaven pointing out your failures. He''s interceding for you—praying for you, advocating for you.

"Who shall separate us from the love of Christ?" Paul lists terrifying possibilities: trouble, hardship, persecution, famine, nakedness, danger, sword. His answer: "In all these things we are more than conquerors through him who loved us."

Not just survivors—conquerors. Not just conquerors—more than conquerors. Even the worst circumstances can''t separate you from Christ''s love.

"Neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord."

Nothing. Absolutely nothing.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'romans-everyday') 
AND day_number = 14;

-- Day 17: Living Sacrifice
UPDATE public.reading_plan_days 
SET context = 'Romans 12 marks a major transition. Chapters 1-11 explained the gospel; chapters 12-16 explain how to live in light of it.

"Therefore, I urge you, brothers and sisters, in view of God''s mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship."

Old Testament sacrifices were dead animals. Paul calls for living sacrifices—offering your entire self (body represents the whole person) to God. Not just Sunday morning, but Monday through Saturday too.

"Do not conform to the pattern of this world, but be transformed by the renewing of your mind."

Two contrasts: conforming vs. transforming, world''s pattern vs. renewed mind. The world constantly pressures you into its mold—values, priorities, behaviors. Transformation happens through mental renewal.

How does your mind get renewed? Scripture, prayer, worship, community—practices that reshape how you think until you think more like Christ.

"Then you will be able to test and approve what God''s will is—his good, pleasing and perfect will."

A renewed mind discerns God''s will. It''s not about looking for miraculous signs but developing wisdom to know what pleases God.

Paul then discusses spiritual gifts: "We have different gifts, according to the grace given to each of us." Everyone has gifts; no one has all gifts; all gifts are needed. Use yours humbly ("Do not think of yourself more highly than you ought") and faithfully.

The Christian life isn''t passive. It''s active, intentional sacrifice. But it flows from mercy received, not effort to earn acceptance. You don''t offer yourself to God to get Him to love you—you offer yourself because He already does.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'romans-everyday') 
AND day_number = 17;

-- ============================================
-- BOOK OF ACTS
-- ============================================

UPDATE public.reading_plans 
SET description = 'Witness the explosive birth and growth of the early church! This 21-day journey through Acts shows how ordinary people, empowered by the Spirit, turned the world upside down with the gospel.'
WHERE slug = 'book-of-acts';

-- Day 1: The Promise of Power
UPDATE public.reading_plan_days 
SET context = 'Acts picks up where Luke''s Gospel ended—with the risen Jesus preparing His disciples for what comes next.

For forty days, Jesus "gave many convincing proofs that he was alive" and taught about the kingdom of God. This wasn''t a fleeting appearance—it was extended preparation for their mission.

The disciples still have expectations to adjust. "Lord, are you at this time going to restore the kingdom to Israel?" They''re still thinking politically—when will you kick out the Romans and make Israel great again?

Jesus redirects them: "It is not for you to know the times or dates the Father has set by his own authority." Some things aren''t their concern. But here''s what is: "You will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth."

This verse outlines the entire book of Acts:
- Power from the Holy Spirit (chapter 2)
- Witnesses in Jerusalem (chapters 2-7)
- Judea and Samaria (chapters 8-12)
- Ends of the earth (chapters 13-28)

Then Jesus is "taken up before their very eyes, and a cloud hid him from their sight." The ascension marks the end of Jesus'' physical presence and the beginning of His presence through His people.

Angels appear: "This same Jesus, who has been taken from you into heaven, will come back in the same way you have seen him go into heaven."

He''s coming back. Until then, His followers have a mission—and they''ll receive power to accomplish it.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'book-of-acts') 
AND day_number = 1;

-- Day 2: Pentecost
UPDATE public.reading_plan_days 
SET context = 'Pentecost was already a Jewish festival—the Feast of Weeks, celebrating the firstfruits of harvest and commemorating the giving of the law at Sinai. What happened that day transformed it forever.

"Suddenly a sound like the blowing of a violent wind came from heaven and filled the whole house where they were sitting. They saw what seemed to be tongues of fire that separated and came to rest on each of them."

Wind and fire—both symbols of God''s presence throughout the Old Testament. The Spirit wasn''t sneaking in quietly; He was making an entrance.

"All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them."

Jews from every nation were in Jerusalem for the festival. Each heard the disciples speaking in their own native language. These weren''t gibberish sounds—they were known languages, miraculously given.

"We hear them declaring the wonders of God in our own tongues!" The curse of Babel (Genesis 11), where languages were confused and humanity scattered, begins to be reversed. The gospel will unite what sin divided.

Peter stands to explain: "This is what was spoken by the prophet Joel: ''In the last days, God says, I will pour out my Spirit on all people.''"

The "last days" have begun. The Spirit isn''t just for prophets and kings anymore—He''s for all God''s people. Young and old, men and women, servants and free—all are included.

This was the church''s birthday. Not an organization launched, but a movement birthed by divine power. About 3,000 people believed and were baptized that day.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'book-of-acts') 
AND day_number = 2;

-- Day 9: Saul's Conversion
UPDATE public.reading_plan_days 
SET context = 'Saul was the early church''s greatest enemy. "Still breathing out murderous threats against the Lord''s disciples," he obtained letters authorizing him to arrest Christians in Damascus. This was religious persecution backed by official power.

Then Jesus interrupted.

"Suddenly a light from heaven flashed around him. He fell to the ground and heard a voice say to him, ''Saul, Saul, why do you persecute me?''"

Notice: Jesus doesn''t ask why Saul persecutes Christians—He asks why Saul persecutes "me." To attack Christ''s people is to attack Christ Himself.

"Who are you, Lord?" Saul asks, perhaps hoping it''s an angel, not wanting to believe what he''s starting to suspect.

"I am Jesus, whom you are persecuting."

Game over. If Jesus is alive, Saul''s entire life—his learning, his zeal, his persecution—has been catastrophically wrong. The resurrection he''d denied is undeniably true.

Saul spends three days blind, not eating or drinking, certainly rethinking everything. Then Ananias—a disciple who had every reason to fear Saul—comes in obedience to Jesus, lays hands on him, and says, "Brother Saul, the Lord—Jesus, who appeared to you on the road as you were coming here—has sent me so that you may see again and be filled with the Holy Spirit."

"Brother Saul." What grace! The persecutor welcomed as family.

Immediately Saul begins preaching that Jesus is the Son of God. The transformation is so dramatic that people can''t believe it. But grace makes new people out of the worst sinners.

If God could save Saul, He can save anyone. Including you.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'book-of-acts') 
AND day_number = 9;

-- Day 17: Paul in Athens
UPDATE public.reading_plan_days 
SET context = 'Athens was the philosophical capital of the ancient world. Socrates, Plato, and Aristotle had walked these streets. The city was full of temples, statues, and competing ideas. Into this intellectual marketplace comes Paul.

"He was greatly distressed to see that the city was full of idols." Paul wasn''t impressed by the culture or intimidated by the philosophers. He was grieved by spiritual blindness.

He reasoned in the synagogue with Jews and in the marketplace with whoever happened by. Epicurean and Stoic philosophers engaged him, curious about his "foreign gods" (Jesus and the resurrection).

They brought him to the Areopagus (Mars Hill), the council that evaluated new teachings. Paul''s speech is a masterclass in contextualized evangelism.

He doesn''t start with Scripture—they don''t accept it. He starts with observation: "I see that in every way you are very religious. For as I walked around and looked carefully at your objects of worship, I even found an altar with this inscription: TO AN UNKNOWN GOD."

They''re hedging their bets, worshipping a god they don''t know. Paul says, "Now what you worship as something unknown I am going to proclaim to you."

He presents God as Creator (not part of creation), self-sufficient (not needing temples or sacrifices), sovereign over nations and history, near to all who seek Him.

Then the challenge: "In the past God overlooked such ignorance, but now he commands all people everywhere to repent. For he has set a day when he will judge the world with justice by the man he has appointed. He has given proof of this to everyone by raising him from the dead."

Some sneered. Some wanted to hear more. A few believed. Different responses to the same message—then and now.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'book-of-acts') 
AND day_number = 17;

-- Day 21: Paul Reaches Rome
UPDATE public.reading_plan_days 
SET context = 'Acts ends not with triumph but with tension. Paul finally reaches Rome—not as a free missionary but as a prisoner awaiting trial before Caesar. Yet even in chains, he''s still on mission.

"For two whole years Paul stayed there in his own rented house and welcomed all who came to see him. He proclaimed the kingdom of God and taught about the Lord Jesus Christ—with all boldness and without hindrance."

"Without hindrance"—the last word in the Greek text. Despite being a prisoner, despite all the opposition he''d faced, the gospel goes forward unhindered.

Paul explains his situation to Jewish leaders in Rome: "It is because of the hope of Israel that I am bound with this chain." He''s not a traitor to Judaism—he believes the Hebrew Scriptures have been fulfilled in Jesus.

The response is mixed, as always. "Some were convinced by what he said, but others would not believe." Paul quotes Isaiah about people hearing but not understanding, seeing but not perceiving.

Then this significant statement: "Therefore I want you to know that God''s salvation has been sent to the Gentiles, and they will listen!"

Acts began in Jerusalem with Jewish believers. It ends in Rome with the gospel going to Gentiles. The movement that started with a handful of Galilean disciples has reached the capital of the empire.

Acts doesn''t really "end"—it just stops. The story continues through the church in every generation. We''re living in Acts 29.

The same Spirit who empowered Peter and Paul empowers you. The same gospel that conquered Rome can still transform lives. The same mission—to the ends of the earth—is still our calling.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'book-of-acts') 
AND day_number = 21;

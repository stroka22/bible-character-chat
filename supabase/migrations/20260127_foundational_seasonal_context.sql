-- Foundational & Seasonal Plans Context
-- Date: 2026-01-27

-- ============================================
-- KEY BIBLE STORIES (21 days)
-- ============================================

UPDATE public.reading_plan_days 
SET context = 'Creation is the starting point for understanding everything. "In the beginning God created the heavens and the earth."

This single sentence answers fundamental questions: Where did everything come from? Is there purpose behind existence? Does a Creator exist?

The materialist says the universe just happened—matter, energy, and time produced everything by chance. Genesis says God spoke, and reality obeyed.

"And God said, ''Let there be light,''" and there was light." Creation by divine word. This is power beyond imagination—speaking existence into being.

God created order from chaos, filling what was "formless and empty." Day 1: light. Day 2: sky and sea. Day 3: land and vegetation. Day 4: sun, moon, stars. Day 5: birds and fish. Day 6: animals and humans.

The pinnacle of creation: "Let us make mankind in our own image." Humans uniquely bear God''s image—a dignity shared by no other creature.

"God saw all that he had made, and it was very good."

The world wasn''t created broken. Evil, suffering, death—these came later, through human choice. But creation itself was "very good."

This matters because it tells us the brokenness we see isn''t original. Something went wrong. And if something went wrong, it can be set right. The Bible is the story of how God does exactly that.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'key-stories-21') 
AND day_number = 1;


-- ============================================
-- TEN COMMANDMENTS (7 days)
-- ============================================

UPDATE public.reading_plan_days 
SET context = 'The Ten Commandments begin with relationship: "I am the LORD your God, who brought you out of Egypt, out of the land of slavery."

Before any commands come, God establishes identity and history. He''s not a stranger issuing arbitrary rules. He''s the God who rescued them.

Law flows from relationship. Israel didn''t obey to earn God''s favor; they obeyed because He had already shown favor.

"You shall have no other gods before me."

First and foundational: exclusive loyalty to God. No competitors, no alternatives, no sharing devotion.

"You shall not make for yourself an image in the form of anything in heaven above or on the earth beneath or in the waters below."

No idols—not because images are inherently evil, but because representing God in created form diminishes Him. He transcends every image.

"You shall not misuse the name of the LORD your God."

God''s name represents His character and reputation. Misuse includes false oaths, casual swearing, and claiming divine authority for human agendas.

"Remember the Sabbath day by keeping it holy."

One day in seven set apart—for rest, for worship, for recognizing that life isn''t all production.

These first four commandments address our relationship with God: exclusive worship, no idols, reverent speech, regular rest.

The remaining six address relationships with others—but they''re grounded in these first four. Love for neighbor flows from love for God.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'ten-commandments-7') 
AND day_number = 1;

UPDATE public.reading_plan_days 
SET context = '"Honor your father and your mother, so that you may live long in the land the LORD your God is giving you."

The fifth commandment bridges vertical and horizontal. Parents represent God to children—the first authority we encounter.

"Honor" includes respect, provision in old age, and recognizing the debt we owe those who raised us. Even imperfect parents have given us life.

"You shall not murder."

Human life is sacred because humans bear God''s image. Taking a life is destroying God''s image-bearer.

Jesus extended this to include anger and contempt. Murder begins in the heart.

"You shall not commit adultery."

Marriage is covenant, and adultery breaks covenant. Sexual faithfulness reflects God''s faithfulness to His people.

"You shall not steal."

Property rights exist because people are image-bearers who create, work, and own. Stealing violates personhood, not just property.

"You shall not give false testimony against your neighbor."

Truth-telling protects community. Lies destroy trust, ruin reputations, and undermine justice.

"You shall not covet."

The final commandment addresses the heart—the source of all other sins. Coveting is wanting what belongs to others, and it leads to theft, adultery, and murder.

Jesus summarized the commandments: love God with all your heart, love your neighbor as yourself. The Ten Commandments unpack what love looks like in practice.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'ten-commandments-7') 
AND day_number = 4;


-- ============================================
-- LORD'S PRAYER (5 days)
-- ============================================

UPDATE public.reading_plan_days 
SET context = '"Our Father in heaven, hallowed be your name."

Jesus teaches us to address God as "Father"—not a distant deity or abstract force but a parent who knows, loves, and cares. "Our" makes it communal; we come together, not just as individuals.

"In heaven"—the Father is transcendent, not a permissive grandfather. He is holy, other, exalted.

"Hallowed be your name"—before any requests, we worship. "Hallowed" means "made holy" or "set apart." We ask that God''s name (His reputation, character, identity) be honored—by us, by others, by all creation.

This first petition reorients our prayers. We tend to start with what we want. Jesus tells us to start with who God is and what He deserves.

"Your kingdom come, your will be done, on earth as it is in heaven."

Again, God''s agenda before ours. We pray for His kingdom to advance—His rule to expand, His reign to be recognized.

"As it is in heaven"—perfect obedience characterizes heaven. We pray for that same obedience on earth. This is revolutionary; it means praying for our own submission, for others'' salvation, for societal transformation.

These opening phrases align us with God''s purposes. We''re not trying to bend God''s will to ours but asking that His will be done. That''s what prayer is for.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'lords-prayer-5') 
AND day_number = 1;

UPDATE public.reading_plan_days 
SET context = '"Give us today our daily bread."

Now personal requests—but notice "daily." Not "give us provisions for the year" or "fill our storehouses." Daily dependence.

This echoes Israel''s manna. They gathered each day, trusting God for tomorrow''s supply. Hoarding failed. They had to depend daily.

Physical needs matter to God. He cares about bread, shelter, health. Spiritual-only Christianity misses this; God created bodies and provides for them.

"Forgive us our debts, as we also have forgiven our debtors."

Sin is debt—obligation to God we can''t repay. We ask forgiveness knowing we owe an unpayable amount.

"As we also have forgiven"—our reception of forgiveness connects to our extension of it. This doesn''t mean we earn forgiveness by forgiving, but that unforgiveness blocks the experience of being forgiven. Someone who won''t forgive hasn''t understood the forgiveness they''ve received.

"And lead us not into temptation, but deliver us from the evil one."

We acknowledge vulnerability. We ask for protection—not just from circumstances but from temptation itself, and from the evil one who orchestrates it.

This is humility. We don''t assume we''ll stand without help. We actively request guidance away from danger and deliverance when danger comes.

The Lord''s Prayer covers it all: worship, submission, provision, forgiveness, protection. If you never knew what to pray, this would be enough.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'lords-prayer-5') 
AND day_number = 3;


-- ============================================
-- BEATITUDES (5 days)
-- ============================================

UPDATE public.reading_plan_days 
SET context = 'The Beatitudes (Matthew 5:3-12) open the Sermon on the Mount. They describe kingdom citizens—people transformed by grace who look different from the world.

"Blessed are the poor in spirit, for theirs is the kingdom of heaven."

"Blessed" means happy, fortunate, to be envied. Jesus pronounces blessing on people the world would pity.

"Poor in spirit"—spiritually bankrupt, recognizing you have nothing to offer God. This isn''t false modesty but honest assessment. "Theirs is the kingdom"—the kingdom belongs to those who know they can''t earn it.

"Blessed are those who mourn, for they will be comforted."

Mourning over sin—their own and the world''s. Taking evil seriously, not making peace with it. God comforts these mourners.

"Blessed are the meek, for they will inherit the earth."

Meekness isn''t weakness but strength under control. Moses was meekest yet confronted Pharaoh. The meek don''t grasp power; they inherit it.

"Blessed are those who hunger and thirst for righteousness, for they will be filled."

Intense longing for righteousness—God''s and their own. Not casual interest but hunger pangs. These will be satisfied.

Notice the pattern: poverty of spirit leads to mourning over sin, mourning produces meekness, meekness creates hunger for righteousness. Each beatitude builds on the previous.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'beatitudes-5') 
AND day_number = 1;


-- ============================================
-- ARMOR OF GOD (6 days)
-- ============================================

UPDATE public.reading_plan_days 
SET context = '"Finally, be strong in the Lord and in his mighty power. Put on the full armor of God, so that you can take your stand against the devil''s schemes."

Spiritual warfare is real. Paul doesn''t say "if" you face the devil but how to stand against him.

"For our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world and against the spiritual forces of evil in the heavenly realms."

The real enemy isn''t visible. People who oppose you aren''t the ultimate battle. Behind human conflict are spiritual forces.

This doesn''t excuse human responsibility but explains the intensity of evil. We''re not just fighting bad ideas or difficult people; we''re fighting demonic influence.

"Therefore put on the full armor of God, so that when the day of evil comes, you may be able to stand your ground, and after you have done everything, to stand."

"Full armor"—nothing missing, no gaps exposed. "When the day of evil comes"—not "if" but "when." Evil days will come. "Stand"—the goal is holding ground, not retreating. The battle may be fierce, but we don''t have to lose territory.

The armor pieces follow, each providing specific protection and capability. Without the armor, we''re defenseless against supernatural enemies.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'armor-god-6') 
AND day_number = 1;

UPDATE public.reading_plan_days 
SET context = '"Stand firm then, with the belt of truth buckled around your waist."

The Roman soldier''s belt held everything together—the sword hung from it, the tunic was tucked into it. Without the belt, the soldier couldn''t function.

Truth is foundational. Without commitment to truth—God''s truth, Scripture''s truth—everything falls apart. Lies, compromise, and self-deception leave us vulnerable.

"With the breastplate of righteousness in place."

The breastplate protected vital organs. Righteousness—both Christ''s righteousness credited to us and the righteous living that flows from it—protects the heart.

When Satan accuses, we point to Christ''s righteousness. When conscience condemns, we remember justification. The breastplate blocks accusation''s arrows.

"With your feet fitted with the readiness that comes from the gospel of peace."

Roman soldiers wore studded sandals for traction. The gospel of peace gives us footing. We stand firm because we know peace with God—not because circumstances are peaceful.

"In addition to all this, take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one."

The Roman shield was large enough to cover the whole body and could be linked with others for a wall. Faith extinguishes flaming arrows—doubts, temptations, lies hurled at us.

"All the flaming arrows"—none get through faith''s shield. But faith must be taken up, actively employed.

"Take the helmet of salvation and the sword of the Spirit, which is the word of God."

The helmet protects the mind; salvation guards our thoughts. And the sword—the only offensive weapon—is God''s word. Jesus used Scripture against Satan. So must we.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'armor-god-6') 
AND day_number = 3;


-- ============================================
-- NAMES OF JESUS (10 days)
-- ============================================

UPDATE public.reading_plan_days 
SET context = 'Jesus'' names reveal His nature and mission. Understanding them deepens our relationship with Him.

"In the beginning was the Word, and the Word was with God, and the Word was God... The Word became flesh and made his dwelling among us."

Jesus is "the Word"—God''s ultimate communication. Just as words express thoughts, Jesus expresses God. He is God''s message to humanity.

"The Word was with God"—distinct from the Father—"and the Word was God"—identical in nature. This is Trinity in seed form.

"For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace" (Isaiah 9:6).

"Wonderful Counselor"—His wisdom amazes; His guidance is perfect. "Mighty God"—not just godly but God Himself. "Everlasting Father"—eternal protector and provider. "Prince of Peace"—He brings reconciliation with God and between people.

"Emmanuel"—"God with us." Not God watching from afar but God present, dwelling among us.

These aren''t just titles but invitations. Need counsel? He''s Wonderful Counselor. Need strength? He''s Mighty God. Need security? He''s Everlasting Father. Need peace? He''s Prince of Peace. Need God''s presence? He''s Emmanuel.

What you need, He is.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'names-jesus-10') 
AND day_number = 1;


-- ============================================
-- EASTER JOURNEY (7 days)
-- ============================================

UPDATE public.reading_plan_days 
SET context = 'Palm Sunday begins the final week. Jesus rode into Jerusalem on a donkey, fulfilling Zechariah 9:9: "See, your king comes to you, righteous and victorious, lowly and riding on a donkey."

The crowds spread cloaks and palm branches, shouting "Hosanna! Blessed is he who comes in the name of the Lord!"

"Hosanna" means "save us." They wanted a military deliverer, a king to overthrow Rome. They got a suffering servant instead.

Jesus wept over Jerusalem: "If you, even you, had only known on this day what would bring you peace—but now it is hidden from your eyes."

He saw what they couldn''t: judgment coming because they missed their moment. Within forty years, Rome would destroy Jerusalem and its temple.

Then Jesus entered the temple and drove out the money changers. "My house will be called a house of prayer, but you are making it a den of robbers."

The religious establishment had commercialized worship. The place meant for encountering God had become about profit.

The week continued with teaching, controversy, plots. The chief priests looked for a way to arrest Jesus. Judas agreed to betray Him for thirty pieces of silver.

The atmosphere was tense—adoring crowds, scheming enemies, an oblivious establishment. Jesus moved steadily toward His destiny, knowing exactly what awaited.

"Now my soul is troubled, and what shall I say? ''Father, save me from this hour''? No, it was for this very reason I came to this hour."'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'easter-journey-7') 
AND day_number = 1;

UPDATE public.reading_plan_days 
SET context = 'Good Friday—the day that changed everything.

After the Last Supper, Jesus went to Gethsemane. He prayed in anguish: "Father, if you are willing, take this cup from me; yet not my will, but yours be done."

The "cup" was God''s wrath against sin. Jesus wasn''t afraid of physical pain; He was facing something infinitely worse—bearing humanity''s sin, experiencing the Father''s judgment, enduring separation from God.

Judas arrived with soldiers. A kiss of betrayal. Jesus was arrested; His disciples fled.

Multiple trials followed—before Annas, Caiaphas, the Sanhedrin, Pilate, Herod, Pilate again. False witnesses, mockery, beatings. Peter denied knowing Jesus three times.

Pilate found no basis for charges but caved to the crowd. "Crucify him!" they shouted. The same voices that cried "Hosanna" now demanded death.

Jesus was flogged—a punishment so brutal many didn''t survive it. Soldiers twisted thorns into a crown and pressed it onto His head. They put a purple robe on Him and mocked: "Hail, king of the Jews!"

He carried His cross to Golgotha. There they nailed Him to the wood. "Father, forgive them, for they do not know what they are doing."

For six hours He hung. Darkness covered the land. Finally: "It is finished." Not defeat but completion. The work was done.

"Father, into your hands I commit my spirit." And He breathed His last.

The centurion watching said, "Surely this was a righteous man." Mark adds: "Surely this man was the Son of God."'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'easter-journey-7') 
AND day_number = 5;

UPDATE public.reading_plan_days 
SET context = 'Easter Sunday—the hinge of history.

Early in the morning, women came to the tomb with burial spices. They expected a corpse. They found angels.

"Why do you look for the living among the dead? He is not here; he has risen!"

The stone was rolled away. The body was gone. The grave clothes lay empty—not unwrapped but collapsed, as if the body had simply passed through them.

The disciples didn''t believe the women''s report. Peter and John ran to see for themselves. The tomb was empty.

Then Jesus appeared. To Mary Magdalene first—she didn''t recognize Him until He spoke her name. To Peter privately. To two disciples on the road to Emmaus. To the gathered disciples behind locked doors.

"Peace be with you." He showed them His hands and side. They touched Him, ate with Him, talked with Him. This wasn''t a ghost or hallucination. He was bodily, physically alive.

Thomas, absent the first time, refused to believe. A week later, Jesus appeared again: "Put your finger here; see my hands. Reach out your hand and put it into my side. Stop doubting and believe."

Thomas answered, "My Lord and my God!"

For forty days, Jesus appeared repeatedly—to individuals, small groups, and once to over 500 people. He taught about the kingdom. He prepared them for what was coming.

Then He ascended, with a promise: "You will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth."

The resurrection changes everything. If Jesus rose, death is defeated. If He rose, His claims are true. If He rose, we will rise too.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'easter-journey-7') 
AND day_number = 7;


-- ============================================
-- CHRISTMAS STORY (7 days)
-- ============================================

UPDATE public.reading_plan_days 
SET context = 'The Christmas story begins with an angel visiting a young woman in an insignificant village.

"In the sixth month of Elizabeth''s pregnancy, God sent the angel Gabriel to Nazareth, a town in Galilee, to a virgin pledged to be married to a man named Joseph, a descendant of David. The virgin''s name was Mary."

Nazareth was so unimportant it''s not mentioned in the Old Testament. Mary was young—probably thirteen to fifteen—and poor. Nothing about her circumstances suggested significance.

"Greetings, you who are highly favored! The Lord is with you."

Mary was "greatly troubled." Angels weren''t common visitors.

"Do not be afraid, Mary; you have found favor with God. You will conceive and give birth to a son, and you are to call him Jesus. He will be great and will be called the Son of the Most High."

The promise was staggering: she would bear the Son of the Most High, who would reign on David''s throne forever.

"How will this be," Mary asked, "since I am a virgin?"

Reasonable question. The angel explained: "The Holy Spirit will come on you, and the power of the Most High will overshadow you. So the holy one to be born will be called the Son of God."

Mary''s response was remarkable: "I am the Lord''s servant. May your word to me be fulfilled."

She didn''t understand fully. She knew the scandal an unwed pregnancy would bring in her honor-shame culture. But she said yes.

This is how God enters the world—not in power and spectacle but quietly, through a willing heart, in an overlooked place.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'christmas-story-7') 
AND day_number = 1;


-- ============================================
-- ADVENT (25 days)
-- ============================================

UPDATE public.reading_plan_days 
SET context = 'Advent means "coming." We prepare for Christmas by remembering why Christ came—and looking forward to His return.

"The people walking in darkness have seen a great light; on those living in the land of deep darkness a light has dawned" (Isaiah 9:2).

Isaiah wrote to people in darkness—spiritual, political, existential darkness. Into that darkness, light would come.

The promise continued: "For to us a child is born, to us a son is given, and the government will be on his shoulders."

Notice: a child born (human), a son given (divine). The Messiah would be both.

"And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace."

Names revealing character: wisdom that amazes, power that is divine, protection that is eternal, peace that reconciles.

Seven hundred years before Bethlehem, Isaiah saw it. The people waited. Generations lived and died in hope.

Advent recaptures that waiting. We who know Christ came still look forward to when He''ll come again. We live between advents—the first accomplished, the second anticipated.

"Of the greatness of his government and peace there will be no end. He will reign on David''s throne and over his kingdom, establishing and upholding it with justice and righteousness from that time on and forever."

The kingdom established at Christ''s first coming will be consummated at His second. What began in a manger will culminate in cosmic restoration.

Advent is about hope—remembering past fulfillment, anticipating future completion.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'advent-25') 
AND day_number = 1;

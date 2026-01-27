-- Add context/teaching column to reading_plan_days
-- This column holds educational narrative that accompanies the Scripture readings
-- Date: 2026-01-27

ALTER TABLE public.reading_plan_days 
ADD COLUMN IF NOT EXISTS context TEXT;

COMMENT ON COLUMN public.reading_plan_days.context IS 'Educational narrative/teaching content that provides historical, theological, or practical context for the day''s readings';

-- ============================================
-- HOW WE GOT THE BIBLE - Full Educational Content
-- ============================================

-- First, let's update the plan description to be more compelling
UPDATE public.reading_plans 
SET description = 'A fascinating 14-day journey through the history of Scripture. Discover how 40+ authors over 1,500 years wrote the Bible, how it was preserved through centuries, and why we can trust it today.'
WHERE slug = 'how-we-got-the-bible';

-- Now update each day with rich context
-- Day 1: God's Word is Inspired
UPDATE public.reading_plan_days 
SET context = 'The Bible is unlike any other book in history. Written over approximately 1,500 years by more than 40 different authors—including kings, shepherds, fishermen, doctors, tax collectors, and tentmakers—it tells one unified story of God''s love for humanity.

But how can a book with so many human authors be "God''s Word"? The answer lies in a concept called "inspiration." The Greek word Paul uses in 2 Timothy 3:16 is "theopneustos," which literally means "God-breathed." This doesn''t mean God dictated every word while humans wrote robotically. Rather, the Holy Spirit worked through each author''s unique personality, background, and writing style to produce exactly what God intended.

Peter explains this further: prophets didn''t just make up their messages—they "spoke from God as they were carried along by the Holy Spirit." The image is of a sailboat carried by the wind. The human authors were active participants, but the divine wind directed their course.

This dual authorship—fully human, fully divine—is why the Bible can be both an ancient document reflecting its historical contexts AND the timeless Word of God that speaks to every generation.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 1;

-- Day 2: Moses - The First Writer
UPDATE public.reading_plan_days 
SET context = 'While oral traditions existed before him, Moses is traditionally considered the first person to write down God''s words in what would become Scripture. This happened around 1400-1200 BC, making the earliest portions of the Bible over 3,000 years old.

Moses didn''t write in a vacuum. He was raised in the Egyptian royal court, educated in all the wisdom of Egypt, then spent 40 years as a shepherd before God called him at the burning bush. This unique background prepared him to lead Israel out of slavery AND to record God''s covenant with His people.

The passage in Exodus 24 describes a pivotal moment: after receiving the Law at Mount Sinai, Moses "wrote down everything the LORD had said." He then read this "Book of the Covenant" aloud to the people, and they responded, "We will do everything the LORD has said; we will obey."

This pattern—God speaks, a prophet writes, the people hear and respond—would be repeated throughout biblical history. Moses wrote the first five books of the Bible (the Torah or Pentateuch): Genesis, Exodus, Leviticus, Numbers, and Deuteronomy. In Deuteronomy, we see him giving instructions for this written law to be preserved and read regularly to future generations.

The Torah became the foundation upon which all later Scripture would build.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 2;

-- Day 3: The Prophets Wrote God's Words
UPDATE public.reading_plan_days 
SET context = 'After Moses, God raised up prophets to speak His word to Israel. But these messages weren''t meant to be forgotten—they were written down and preserved.

The prophetic books span roughly 400 years (around 800-400 BC). During this time, God sent messengers like Isaiah, Jeremiah, Ezekiel, and the twelve "minor prophets" to call Israel back to faithfulness. Their messages combined immediate warnings about judgment with breathtaking promises about a future Messiah and the restoration of all things.

In today''s reading from Jeremiah, we get a rare behind-the-scenes look at how a prophetic book was created. God told Jeremiah to write down all the words He had spoken over 23 years of ministry. Jeremiah dictated to his scribe Baruch, who wrote on a scroll. When King Jehoiakim burned that scroll in defiance, God had Jeremiah dictate it again—with additional material added!

This shows us several things: (1) God wanted His words preserved in writing, not just spoken. (2) Human agents (like Baruch the scribe) played important roles. (3) Even powerful kings couldn''t destroy God''s Word—when one scroll was burned, another was made.

Isaiah 8:1 shows another method: God sometimes told prophets to write on tablets or scrolls as public witnesses, so that when the prophecy was fulfilled, people could verify that God had spoken in advance.

The prophetic books became the second major section of the Hebrew Bible.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 3;

-- Day 4: David - Poet and Prophet
UPDATE public.reading_plan_days 
SET context = 'The Book of Psalms is the Bible''s hymnbook—150 songs and poems that express the full range of human emotion in relationship with God. About half are attributed to David, the shepherd-king who lived around 1000 BC.

David wasn''t just a talented musician; he was a prophet. In today''s reading from 2 Samuel 23, we hear David''s "last words," where he declares: "The Spirit of the LORD spoke through me; his word was on my tongue." David understood that his psalms weren''t merely personal expression—they were inspired by God''s Spirit.

This prophetic nature of the Psalms is confirmed in Acts 2, where Peter quotes Psalm 16 and attributes it to David speaking "by the Holy Spirit" about events David couldn''t have naturally known—specifically, the resurrection of Christ, which would happen 1,000 years after David''s death.

The Psalms were used in Israel''s worship at the Temple. They were memorized, sung, and passed down through generations. Jesus himself quoted the Psalms more than any other Old Testament book. When he was dying on the cross, he cried out the opening words of Psalm 22: "My God, my God, why have you forsaken me?"

The Psalms, along with Proverbs, Ecclesiastes, Job, and Song of Solomon, form the "Writings" section of the Hebrew Bible—poetry and wisdom literature that shows us how to live in covenant relationship with God.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 4;

-- Day 5: Solomon's Wisdom
UPDATE public.reading_plan_days 
SET context = 'King Solomon, David''s son, reigned during Israel''s golden age (around 970-930 BC). He was famous throughout the ancient world for his wisdom—and much of that wisdom was preserved in Scripture.

The story in 1 Kings 3 explains how Solomon received this gift. When God offered him anything he wanted, Solomon didn''t ask for wealth, long life, or victory over enemies. He asked for wisdom to govern God''s people justly. God was so pleased that He gave Solomon not only unparalleled wisdom but also the riches and honor he hadn''t requested.

Solomon "spoke three thousand proverbs and his songs numbered a thousand and five" (1 Kings 4:32). While we don''t have all of these, the Book of Proverbs preserves many of his wise sayings. He also wrote Ecclesiastes (his philosophical reflection on the meaning of life) and Song of Solomon (a celebration of love).

The wisdom literature Solomon contributed serves a unique purpose in the Bible. While the Law tells us what God commands and the Prophets tell us what God is doing in history, Wisdom literature teaches us how to navigate daily life skillfully. It addresses practical matters: relationships, work, money, speech, temptation, and the fear of the Lord that is the beginning of wisdom.

However, Solomon''s life also serves as a warning. Despite his wisdom, he disobeyed God''s commands about foreign wives, and his heart was led astray to worship other gods. His writings endure; his faithfulness did not. The Bible honestly records both.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 5;

-- Day 6: Ezra and the Preservation of Scripture
UPDATE public.reading_plan_days 
SET context = 'One of the most critical moments in the Bible''s history came after a national catastrophe. In 586 BC, Babylon destroyed Jerusalem and the Temple, carrying the Jewish people into exile. The scrolls of Scripture could have been lost forever.

But God preserved His Word through faithful people like Ezra, a priest and scribe who lived during and after the exile (around 480-440 BC). Ezra "devoted himself to the study and observance of the Law of the LORD, and to teaching its decrees and laws in Israel" (Ezra 7:10).

When the Jews returned from exile, there was a danger that the younger generation—born in Babylon—wouldn''t know God''s Word. Nehemiah 8 records a pivotal moment: Ezra stood on a high wooden platform and read from the Book of the Law from daybreak until noon. The people stood and listened for hours. Levites helped explain the meaning so everyone could understand.

This wasn''t just a religious service—it was a national recommitment to God''s covenant. The people wept when they heard the Law read, realizing how far they had strayed. Then they celebrated, because they finally understood God''s words.

Jewish tradition credits Ezra with organizing the Hebrew Scriptures into their final form and establishing the tradition of scribes who would carefully copy and preserve the sacred texts. The meticulous scribal practices that developed—counting letters, checking every line—ensured the Old Testament would be transmitted with remarkable accuracy for centuries to come.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 6;

-- Day 7: Jesus Affirms the Old Testament
UPDATE public.reading_plan_days 
SET context = 'By the time Jesus was born, the Old Testament had been complete for about 400 years. The Jewish people recognized a collection of sacred writings divided into three sections: the Law (Torah), the Prophets, and the Writings. Jesus refers to this threefold division in Luke 24:44.

Jesus'' attitude toward these Scriptures is crucial for understanding the Bible''s authority. He didn''t treat them as merely human literature or as outdated religious texts. He affirmed them as the authoritative Word of God.

In Matthew 5:17-18, Jesus makes an astounding claim: "Do not think that I have come to abolish the Law or the Prophets; I have not come to abolish them but to fulfill them." He then says that not even the smallest letter or stroke of a pen would disappear from the Law until everything is accomplished.

This is remarkable. Jesus affirmed the complete trustworthiness of the Old Testament down to its smallest details. He quoted from Genesis, Exodus, Deuteronomy, Psalms, Isaiah, Daniel, and many other books, always treating them as authoritative.

After his resurrection, Jesus walked with two disciples on the road to Emmaus and gave them the ultimate Bible study: "Beginning with Moses and all the Prophets, he explained to them what was said in all the Scriptures concerning himself" (Luke 24:27). The entire Old Testament, Jesus taught, points to him.

This is why Christians read the Old Testament differently than Jewish readers. We see it as the first act of a drama that reaches its climax in Jesus Christ.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 7;

-- Day 8: The Gospels - Eyewitness Accounts
UPDATE public.reading_plan_days 
SET context = 'For roughly 30 years after Jesus'' resurrection, his story was spread primarily by word of mouth. The apostles preached, eyewitnesses shared their experiences, and the church grew rapidly. But as time passed and eyewitnesses began to die, it became essential to preserve their testimony in writing.

The four Gospels—Matthew, Mark, Luke, and John—were written between approximately AD 50-95. Each offers a unique perspective on Jesus'' life, death, and resurrection.

Luke''s introduction (which we read today) is remarkably transparent about his methodology. He wasn''t an eyewitness himself, but he "carefully investigated everything from the beginning" by interviewing those who were "eyewitnesses and servants of the word." His goal was to write "an orderly account" so that his reader Theophilus could "know the certainty" of what he had been taught.

This is historical research! Luke names specific rulers and dates, allowing his account to be verified against other historical records. He traveled with Paul and likely interviewed Mary, Jesus'' mother, and many others.

John''s Gospel, written later, was composed by "the disciple whom Jesus loved"—one of Jesus'' closest companions. John 21:24 declares: "This is the disciple who testifies to these things and who wrote them down. We know that his testimony is true."

The Gospels aren''t myths that developed over centuries. They were written within the lifetime of eyewitnesses who could confirm or deny their accuracy. This makes them among the best-attested documents of the ancient world.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 8;

-- Day 9: Paul's Letters to the Churches
UPDATE public.reading_plan_days 
SET context = 'The apostle Paul wrote at least 13 letters that are preserved in the New Testament—nearly half of its 27 books. These weren''t originally intended as "Scripture" in Paul''s mind; they were pastoral correspondence to churches and individuals he cared about deeply.

Yet something remarkable happened. Paul''s letters began circulating beyond their original recipients almost immediately. In Colossians 4:16, Paul instructs: "After this letter has been read to you, see that it is also read in the church of the Laodiceans and that you in turn read the letter from Laodicea."

Churches were sharing Paul''s letters with each other! They recognized that his teaching had authority beyond his physical presence. He was, after all, an apostle—one personally commissioned by the risen Christ.

Even more striking is what Peter says in today''s reading. Writing about Paul''s letters, Peter notes they contain "some things that are hard to understand" but then places them in the same category as "the other Scriptures." This is extraordinary: within the apostolic period itself, Paul''s letters were already being recognized as Scripture on par with the Old Testament.

Paul''s letters were written between approximately AD 49-67. They address real problems in real churches—divisions, false teaching, moral failures, questions about the end times. Yet they have proven timelessly relevant because they explain the gospel and its implications with unmatched clarity.

Romans, Galatians, Ephesians, Philippians—these letters have shaped Christian theology for 2,000 years.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 9;

-- Day 10: The Apostles' Authority
UPDATE public.reading_plan_days 
SET context = 'Why do we have 27 books in the New Testament and not others? The early church didn''t accept just any writing about Jesus or Christian living. They applied specific criteria, and the most important was apostolic authority.

The apostles held a unique position. They were personally chosen and commissioned by Jesus. They witnessed his resurrection. They were promised the Holy Spirit would guide them into all truth (John 16:13). This gave their teaching a special authority that others didn''t have.

In 1 Corinthians 14:37, Paul writes: "If anyone thinks they are a prophet or otherwise gifted by the Spirit, let them acknowledge that what I am writing to you is the Lord''s command." This is a bold claim! Paul expected his letters to be received as authoritative—not because of his personal brilliance, but because of his apostolic calling.

Similarly, in 1 Thessalonians 2:13, Paul thanks God that when the Thessalonians received his message, they "accepted it not as a human word, but as it actually is, the word of God."

The early church recognized this apostolic authority. Books written by apostles (Matthew, John, Paul, Peter) or by their close associates (Mark with Peter, Luke with Paul) were accepted. Books claiming apostolic authorship but written much later (like the "Gospel of Thomas" from the 2nd century) were rejected.

This is why the New Testament canon closed with the apostolic age. No one after the apostles could claim their unique authority as eyewitnesses commissioned directly by Christ.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 10;

-- Day 11: Scripture is Complete
UPDATE public.reading_plan_days 
SET context = 'A common misconception is that the New Testament canon was decided at the Council of Nicaea in AD 325. This isn''t accurate. Nicaea dealt with theological controversies about Christ''s divinity—the biblical canon wasn''t even on the agenda.

The reality is that the core of the New Testament was recognized much earlier. By AD 130, the four Gospels and Paul''s letters were widely circulated and accepted. Lists of accepted books from the 2nd and 3rd centuries show remarkable consistency. The church didn''t "choose" which books to include so much as recognize which books God had already given through the apostles.

The formal recognition of the 27-book New Testament came in the 4th century (Councils of Hippo in 393 and Carthage in 397), but this was confirming what churches had practiced for generations—not creating something new.

The closing verses of Revelation carry a solemn warning: don''t add to or take away from "this book." While this specifically refers to Revelation, it reflects a principle throughout Scripture. The Bible presents itself as a complete revelation.

Jude speaks of "the faith that was once for all entrusted to God''s holy people." The word "once for all" (Greek: hapax) means "once and never to be repeated." The apostolic deposit of faith is complete. We don''t expect new books of the Bible.

This doesn''t mean God stopped speaking—He speaks through His Word, His Spirit, and His church. But the canon of Scripture is closed. We have everything we need for "life and godliness" (2 Peter 1:3).'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 11;

-- Day 12: The Word Stands Forever
UPDATE public.reading_plan_days 
SET context = 'The Bible has survived attempts to destroy it that would have eliminated any other book. Roman emperors ordered copies burned. Medieval authorities restricted access. Modern critics declared it outdated. Yet it remains the world''s bestselling book year after year.

Isaiah''s declaration is striking: "The grass withers and the flowers fall, but the word of our God endures forever." Written 2,700 years ago, this has proven remarkably true.

How was the Bible preserved? Through painstaking human effort guided by divine providence.

For the Old Testament, Jewish scribes called Masoretes developed incredibly detailed systems for copying. They counted every letter in every book. They noted the middle letter of each book. If a copy had errors, it was destroyed. The discovery of the Dead Sea Scrolls in 1947 vindicated their work: manuscripts 1,000 years older than previously known copies showed the text had been transmitted with amazing accuracy.

For the New Testament, we have over 5,800 Greek manuscripts—far more than any other ancient document. While there are minor variations between copies (spelling differences, word order), no essential Christian doctrine is affected. Scholars can reconstruct the original text with remarkable confidence.

Peter quotes Isaiah and applies it to the gospel message: "You have been born again... through the living and enduring word of God." The same Word that created the universe sustains it. The same Word that spoke through prophets now gives us new birth.

Kingdoms rise and fall. Philosophies come and go. But God''s Word endures.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 12;

-- Day 13: The Word is Living and Active
UPDATE public.reading_plan_days 
SET context = 'The Bible isn''t merely an ancient document to be studied like other historical texts. It''s described as "living and active"—it does something to those who encounter it.

Hebrews 4:12 uses vivid imagery: God''s Word is "sharper than any double-edged sword." A sword cuts, penetrates, divides. Scripture does the same to our souls. It exposes our true thoughts and motives. We can hide from others, even deceive ourselves, but we cannot hide from God''s Word.

This is why Bible reading can be uncomfortable. It diagnoses sin we''d rather ignore. It challenges assumptions we hold dear. It demands response.

James adds another dimension: Scripture is like a mirror. When we look into it, we see ourselves as we really are. But James warns against merely glancing at the mirror and walking away unchanged. The person who "looks intently into the perfect law that gives freedom, and continues in it" will be blessed in what they do.

This is the Bible''s purpose—not merely to inform but to transform. Not just to be studied but to be obeyed. The goal isn''t to master Scripture but to let Scripture master us.

Throughout church history, God''s Word has transformed individuals and societies. Slaves have found freedom. Addicts have found deliverance. Enemies have been reconciled. The proud have been humbled. The broken have found healing.

The same Word that spoke creation into existence speaks today with power to recreate human hearts.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 13;

-- Day 14: Our Response to God's Word
UPDATE public.reading_plan_days 
SET context = 'We''ve traced the Bible''s remarkable journey—from Moses writing on Mount Sinai, through the prophets and poets of Israel, to the eyewitness testimony of the apostles, through centuries of careful preservation to the book you hold today. Now comes the most important question: What will you do with it?

Psalm 119, the longest chapter in the Bible, is a love letter to God''s Word. The psalmist asks, "How can a young person stay on the path of purity?" and answers, "By living according to your word." He describes hiding God''s Word in his heart to avoid sin, meditating on it day and night, delighting in it more than treasure.

Joshua 1:8 gives a formula for success in God''s eyes: "Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it. Then you will be prosperous and successful."

Notice the progression: keep it on your lips (speak it), meditate on it (think deeply about it), do everything written in it (obey it). Success comes not from merely owning a Bible or occasionally reading it, but from letting it saturate your mind and shape your actions.

You''ve learned how we got the Bible. Now the question is: How will the Bible get you?

Will you read it regularly? Study it carefully? Memorize its truths? Discuss it with others? Most importantly, will you obey what it says?

God has gone to extraordinary lengths to give you His Word. The appropriate response is to treasure it, study it, and live by it—not as a burden, but as the privilege it is.'
WHERE plan_id = (SELECT id FROM public.reading_plans WHERE slug = 'how-we-got-the-bible') 
AND day_number = 14;

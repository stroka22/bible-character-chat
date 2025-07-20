/**
 * Bible Character Chat - Character Selection Fix
 * This script fixes the character display and interaction in the standalone chat app
 */

// Main initialization function
function initializeCharacterSelection() {
    // DOM References
    const selectionViewBtn = document.getElementById('selectionViewBtn');
    const chatViewBtn = document.getElementById('chatViewBtn');
    const selectionView = document.getElementById('selectionView');
    const chatView = document.getElementById('chatView');
    const backBtn = document.getElementById('backBtn');
    const homeLink = document.getElementById('homeLink');
    const charactersLink = document.getElementById('charactersLink');
    const featuredCharacterBtn = document.getElementById('featuredCharacterBtn');
    const characterBreadcrumb = document.getElementById('characterBreadcrumb');

    // Character Selection
    const gridEl = document.getElementById('character-grid');
    const listEl = document.getElementById('character-list');
    const resultCountEl = document.querySelector('.results-count');
    const activeFilterEl = document.querySelector('.active-filters');
    const searchInput = document.getElementById('search');
    const testamentBtns = [...document.querySelectorAll('.testament-filter')];
    const bookSel = document.getElementById('book');
    const groupSel = document.getElementById('group');
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    const alphaLinks = [...document.querySelectorAll('.alpha-nav a')];
    const paginationWrap = document.querySelector('.pagination');

    // Chat Interface
    const chatMain = document.getElementById('chatMain');
    const chatCharacterAvatar = document.getElementById('chatCharacterAvatar');
    const chatHeaderTitle = document.getElementById('chatHeaderTitle');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessage = document.getElementById('sendMessage');

    // Insights Panel
    const insightsToggle = document.getElementById('insightsToggle');
    const insightsPanel = document.getElementById('insightsPanel');
    const closeInsights = document.getElementById('closeInsights');
    const insightsAvatar = document.getElementById('insightsAvatar');
    const insightsPanelTitle = document.getElementById('insightsPanelTitle');
    const historicalContext = document.getElementById('historicalContext');
    const scriptureReferences = document.getElementById('scriptureReferences');
    const theologicalSignificance = document.getElementById('theologicalSignificance');
    const relationships = document.getElementById('relationships');
    const studyQuestions = document.getElementById('studyQuestions');
    const sections = document.querySelectorAll('.insights-panel section');

    // State
    const itemsPerPage = 9;
    let currentPage = 1;
    let viewMode = 'grid';
    const filters = { search: '', testament: 'all', book: 'all', group: 'all', letter: 'All' };
    let selectedCharacter = null;
    let chatHistory = [];

    // Filter characters based on current filters
    const applyFilters = () => {
        let data = [...window.characters];
        if (filters.search) {
            const q = filters.search.toLowerCase();
            data = data.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q)
            );
        }
        if (filters.testament !== 'all') {
            data = data.filter(c => c.testament === filters.testament.toLowerCase());
        }
        if (filters.book !== 'all') {
            data = data.filter(c => c.book === filters.book);
        }
        if (filters.group !== 'all') {
            data = data.filter(c => c.group === filters.group);
        }
        if (filters.letter !== 'All') {
            data = data.filter(c => c.name.startsWith(filters.letter));
        }
        return data;
    };

    // Sync UI with filter state
    const syncInputs = () => {
        searchInput.value = filters.search;
        testamentBtns.forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === (filters.testament === 'all' ? 'all' : filters.testament));
        });
        bookSel.value = filters.book;
        groupSel.value = filters.group;
        alphaLinks.forEach(a => a.classList.toggle('active', a.textContent === filters.letter));
        gridBtn.classList.toggle('active', viewMode === 'grid');
        listBtn.classList.toggle('active', viewMode === 'list');
    };

    // Format timestamp for chat messages
    const formatTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Render active filter chips
    const renderActiveChips = () => {
        // Clear existing dynamic chips
        document.querySelectorAll('.dynamic-chip').forEach(c => c.remove());
        
        // Add new chips for active filters
        const add = (txt, key) => {
            const chip = document.createElement('div');
            chip.className = 'filter-chip dynamic-chip';
            chip.innerHTML = `<span>${txt}</span><span class="remove">×</span>`;
            chip.querySelector('.remove').onclick = () => {
                filters[key] = key === 'search' ? '' : (key === 'letter' ? 'All' : 'all');
                currentPage = 1;
                syncInputs();
                render();
            };
            activeFilterEl.appendChild(chip);
        };
        
        if (filters.search) add(`"${filters.search}"`, 'search');
        if (filters.testament !== 'all') add(filters.testament === 'old' ? 'Old Testament' : 'New Testament', 'testament');
        if (filters.book !== 'all') add(filters.book, 'book');
        if (filters.group !== 'all') add(filters.group, 'group');
        if (filters.letter !== 'All') add(`Starts with "${filters.letter}"`, 'letter');
    };

    // Render pagination controls
    const renderPagination = total => {
        paginationWrap.innerHTML = '';
        
        // Helper to create pagination buttons
        const btn = (label, disabled, cb) => {
            const b = document.createElement('button');
            b.innerHTML = label;
            if (disabled) b.disabled = true;
            b.onclick = cb;
            return b;
        };
        
        // Previous button
        paginationWrap.appendChild(btn('«', currentPage === 1, () => { currentPage--; render(); }));
        
        // Page numbers
        for (let i = 1; i <= total; i++) {
            if (i > 5 && i < total - 1 && total > 7) {
                if (i === 6) {
                    const span = document.createElement('span');
                    span.textContent = '…';
                    span.style.margin = '0 8px';
                    paginationWrap.appendChild(span);
                }
                continue;
            }
            
            const b = btn(i, false, () => { currentPage = i; render(); });
            if (i === currentPage) b.classList.add('active');
            paginationWrap.appendChild(b);
        }
        
        // Next button
        paginationWrap.appendChild(btn('»', currentPage === total, () => { currentPage++; render(); }));
    };

    // Render character cards/list items
    const renderCharacters = data => {
        gridEl.innerHTML = '';
        listEl.innerHTML = '';
        const target = viewMode === 'grid' ? gridEl : listEl;
        
        data.forEach(c => {
            const el = document.createElement('div');
            el.className = viewMode === 'grid' ? 'character-card' : 'character-list-item';
            
            if (viewMode === 'grid') {
                // Table-based circular image for grid view
                el.innerHTML = `
                    <table style="border-collapse: collapse; margin: 0 auto 15px;">
                        <tr>
                            <td style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden; border: 4px solid #facc15; box-shadow: 0 0 15px rgba(250, 204, 21, 0.55); padding: 0;">
                                <img src="${c.img}" alt="${c.name}" style="width: 150px; height: 150px; display: block; object-fit: cover;">
                            </td>
                        </tr>
                    </table>
                    <h3>${c.name}</h3>
                    <p>${c.description}</p>
                `;
            } else {
                // Table-based circular image for list view
                el.innerHTML = `
                    <table style="border-collapse: collapse; margin-right: 20px;">
                        <tr>
                            <td style="width: 90px; height: 90px; border-radius: 50%; overflow: hidden; border: 3px solid #facc15; box-shadow: 0 0 12px rgba(250, 204, 21, 0.55); padding: 0;">
                                <img src="${c.img}" alt="${c.name}" style="width: 90px; height: 90px; display: block; object-fit: cover;">
                            </td>
                        </tr>
                    </table>
                    <div class="info">
                        <h3>${c.name}</h3>
                        <p>${c.description}</p>
                        <div class="meta">${c.testament === 'old' ? 'Old Testament' : 'New Testament'} • ${c.book} • ${c.group}</div>
                    </div>
                `;
            }
            
            // Add click handler to select character and switch to chat view
            el.onclick = () => selectCharacter(c);
            
            target.appendChild(el);
        });
        
        gridEl.style.display = viewMode === 'grid' ? 'grid' : 'none';
        listEl.style.display = viewMode === 'list' ? 'flex' : 'none';
    };

    // Main render function for character selection
    const render = () => {
        const filtered = applyFilters();
        const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
        currentPage = Math.min(currentPage, totalPages);
        const start = (currentPage - 1) * itemsPerPage;
        const pageItems = filtered.slice(start, start + itemsPerPage);

        resultCountEl.textContent = `Showing ${pageItems.length} of ${filtered.length} characters`;
        renderCharacters(pageItems);
        renderPagination(totalPages);
        renderActiveChips();
    };

    // Select a character and switch to chat view
    const selectCharacter = (character) => {
        selectedCharacter = character;
        
        // Update chat interface with character info
        chatCharacterAvatar.src = character.img;
        chatCharacterAvatar.alt = character.name;
        chatHeaderTitle.textContent = `Chat with ${character.name}`;
        characterBreadcrumb.textContent = character.name;
        
        // Update insights panel
        insightsAvatar.src = character.img;
        insightsAvatar.alt = character.name;
        insightsPanelTitle.textContent = `${character.name} Insights`;
        
        // Set historical context
        if (character.historicalContext) {
            historicalContext.innerHTML = character.historicalContext;
        } else {
            historicalContext.innerHTML = '<p>No historical context available.</p>';
        }
        
        // Set theological significance
        if (character.theologicalSignificance) {
            theologicalSignificance.innerHTML = character.theologicalSignificance;
        } else {
            theologicalSignificance.innerHTML = '<p>No theological significance available.</p>';
        }
        
        // Render scripture references
        scriptureReferences.innerHTML = '';
        if (character.scriptures && character.scriptures.length > 0) {
            const ul = document.createElement('ul');
            character.scriptures.forEach(scripture => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="scripture-reference" data-reference="${scripture.reference}">
                        ${scripture.reference}
                        <div class="scripture-popover">
                            <strong>${scripture.reference}</strong>
                            <p>${scripture.text}</p>
                            <div class="attribution">ESV® Text Edition: 2016</div>
                        </div>
                    </span>
                `;
                ul.appendChild(li);
            });
            scriptureReferences.appendChild(ul);
        } else {
            scriptureReferences.textContent = 'No scripture references available.';
        }
        
        // Render relationships
        relationships.innerHTML = '';
        if (character.relationships) {
            Object.entries(character.relationships).forEach(([group, members]) => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'relationship-group';
                
                const title = document.createElement('h5');
                title.textContent = group.charAt(0).toUpperCase() + group.slice(1);
                groupDiv.appendChild(title);
                
                members.forEach(name => {
                    const chip = document.createElement('span');
                    chip.className = 'relationship-chip';
                    chip.textContent = name;
                    groupDiv.appendChild(chip);
                });
                
                relationships.appendChild(groupDiv);
            });
        } else {
            relationships.textContent = 'No relationship information available.';
        }
        
        // Render study questions
        studyQuestions.innerHTML = '';
        if (character.studyQuestions && character.studyQuestions.length > 0) {
            const ul = document.createElement('ul');
            character.studyQuestions.forEach(question => {
                const li = document.createElement('li');
                li.textContent = question;
                ul.appendChild(li);
            });
            studyQuestions.appendChild(ul);
        } else {
            studyQuestions.textContent = 'No study questions available.';
        }
        
        // Clear existing messages and add opening line if available
        chatMessages.innerHTML = '';
        if (character.openingLine) {
            const messageEl = document.createElement('div');
            messageEl.className = 'message-bubble character-message';
            messageEl.textContent = character.openingLine;
            chatMessages.appendChild(messageEl);
            
            // Add to chat history
            chatHistory = [{ role: 'assistant', content: character.openingLine }];
        }
        
        // Switch to chat view
        selectionView.style.display = 'none';
        chatView.style.display = 'block';
        selectionViewBtn.classList.remove('active');
        chatViewBtn.classList.add('active');
    };

    // Send a message in chat
    const sendUserMessage = () => {
        const content = chatInput.value.trim();
        if (!content) return;
        
        // Clear input
        chatInput.value = '';
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message-bubble user-message';
        userMessage.textContent = content;
        chatMessages.appendChild(userMessage);
        
        // Add to chat history
        chatHistory.push({ role: 'user', content });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Generate response after a short delay
        setTimeout(() => {
            // In a real app, this would call an AI API
            const responseText = `I hear your question about "${content}". In my teachings, I often spoke about seeking first the kingdom of God.`;
            
            const responseMessage = document.createElement('div');
            responseMessage.className = 'message-bubble character-message';
            responseMessage.textContent = responseText;
            chatMessages.appendChild(responseMessage);
            
            // Add to chat history
            chatHistory.push({ role: 'assistant', content: responseText });
            
            // Scroll to bottom again
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    };

    // Set up event handlers
    const setupEventHandlers = () => {
        // Navigation events
        selectionViewBtn.addEventListener('click', () => {
            selectionView.style.display = 'block';
            chatView.style.display = 'none';
            selectionViewBtn.classList.add('active');
            chatViewBtn.classList.remove('active');
        });
        
        chatViewBtn.addEventListener('click', () => {
            if (selectedCharacter) {
                selectionView.style.display = 'none';
                chatView.style.display = 'block';
                selectionViewBtn.classList.remove('active');
                chatViewBtn.classList.add('active');
            } else {
                alert('Please select a character first');
            }
        });
        
        // Back button and breadcrumb links
        backBtn.addEventListener('click', () => {
            selectionView.style.display = 'block';
            chatView.style.display = 'none';
            selectionViewBtn.classList.add('active');
            chatViewBtn.classList.remove('active');
        });
        
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            selectionView.style.display = 'block';
            chatView.style.display = 'none';
            selectionViewBtn.classList.add('active');
            chatViewBtn.classList.remove('active');
        });
        
        charactersLink.addEventListener('click', (e) => {
            e.preventDefault();
            selectionView.style.display = 'block';
            chatView.style.display = 'none';
            selectionViewBtn.classList.add('active');
            chatViewBtn.classList.remove('active');
        });
        
        // Featured character button
        featuredCharacterBtn.addEventListener('click', () => {
            const jesus = window.characters.find(c => c.name === 'Jesus');
            if (jesus) selectCharacter(jesus);
        });
        
        // Filter events
        searchInput.addEventListener('input', () => {
            filters.search = searchInput.value.trim();
            currentPage = 1;
            render();
        });
        
        testamentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filters.testament = btn.textContent.toLowerCase();
                currentPage = 1;
                render();
            });
        });
        
        bookSel.addEventListener('change', () => {
            filters.book = bookSel.value;
            currentPage = 1;
            render();
        });
        
        groupSel.addEventListener('change', () => {
            filters.group = groupSel.value;
            currentPage = 1;
            render();
        });
        
        alphaLinks.forEach(a => {
            a.addEventListener('click', () => {
                filters.letter = a.textContent;
                currentPage = 1;
                render();
            });
        });
        
        // View toggle
        gridBtn.addEventListener('click', () => {
            viewMode = 'grid';
            render();
        });
        
        listBtn.addEventListener('click', () => {
            viewMode = 'list';
            render();
        });
        
        // Chat events
        chatInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        });
        
        sendMessage.addEventListener('click', sendUserMessage);
        
        // Insights panel
        insightsToggle.addEventListener('click', () => {
            const isOpen = insightsPanel.classList.toggle('open');
            insightsToggle.classList.toggle('active', isOpen);
            chatMain.classList.toggle('panel-open', isOpen);
        });
        
        closeInsights.addEventListener('click', () => {
            insightsPanel.classList.remove('open');
            insightsToggle.classList.remove('active');
            chatMain.classList.remove('panel-open');
        });
        
        // Collapsible sections
        sections.forEach(section => {
            const heading = section.querySelector('h4');
            heading.addEventListener('click', () => {
                section.classList.toggle('collapsed');
            });
        });
        
        // Share button
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: `Chat with ${selectedCharacter?.name || 'Biblical Characters'}`,
                    text: `Check out my conversation with ${selectedCharacter?.name || 'Biblical Characters'}!`,
                    url: window.location.href
                }).catch(() => {
                    alert('Link copied to clipboard');
                });
            } else {
                alert('Link copied to clipboard');
            }
        });
    };

    // Initialize
    setupEventHandlers();
    render();
    console.log('Bible Character Chat - Character Selection initialized');
}

// Make characters available globally
window.characters = [
    {
        id: '1',
        name: 'Jesus',
        description: 'Central figure of Christianity who taught through parables and performed miracles.',
        testament: 'new',
        book: 'Matthew',
        group: 'Messiah',
        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&q=80',
        openingLine: 'Peace be with you. What would you like to know?',
        historicalContext: '<p><strong>Time Period:</strong> New Testament Era</p><p><strong>Location:</strong> Bethlehem, Nazareth, Jerusalem, Galilee</p><p>Born in Bethlehem, lived in Nazareth, ministered throughout Galilee and Judea under Roman rule. A time of significant religious and political tension between Jewish traditions and Roman occupation.</p>',
        theologicalSignificance: '<p>Jesus is the embodiment of God\'s love and salvation. He is the bridge between God and humanity, offering forgiveness of sins and eternal life through His sacrifice. His teachings emphasize love, compassion, justice, and the establishment of God\'s kingdom.</p>',
        scriptures: [
            {
                reference: 'John 3:16',
                text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.'
            },
            {
                reference: 'Matthew 28:19-20',
                text: 'Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you. And behold, I am with you always, to the end of the age.'
            },
            {
                reference: 'Philippians 2:5-11',
                text: 'Have this mind among yourselves, which is yours in Christ Jesus, who, though he was in the form of God, did not count equality with God a thing to be grasped, but emptied himself, by taking the form of a servant, being born in the likeness of men. And being found in human form, he humbled himself by becoming obedient to the point of death, even death on a cross. Therefore God has highly exalted him and bestowed on him the name that is above every name, so that at the name of Jesus every knee should bow, in heaven and on earth and under the earth, and every tongue confess that Jesus Christ is Lord, to the glory of God the Father.'
            }
        ],
        relationships: {
            'disciples': ['Peter', 'James', 'John', 'Andrew', 'Philip', 'Bartholomew', 'Matthew', 'Thomas', 'James (son of Alphaeus)', 'Thaddaeus', 'Simon the Zealot', 'Judas Iscariot'],
            'family': ['Mary', 'Joseph', 'James', 'Joses', 'Simon', 'Judas'],
            'followers': ['Mary Magdalene', 'Martha', 'Lazarus']
        },
        studyQuestions: [
            'What does it mean to truly love your neighbor?',
            'How can one find peace in a troubled world?',
            'What is the most important commandment?'
        ]
    },
    {
        id: '2',
        name: 'Mary',
        description: 'Mother of Jesus noted for her faith and obedience.',
        testament: 'new',
        book: 'Luke',
        group: 'Women',
        img: 'https://images.unsplash.com/photo-1591059683048-9a6208e91d2c?auto=format&fit=crop&w=150&q=80',
        openingLine: 'My soul magnifies the Lord. How may I help you understand God\'s ways?',
        historicalContext: '<p><strong>Time Period:</strong> New Testament Era</p><p><strong>Location:</strong> Nazareth, Bethlehem, Egypt, Jerusalem</p><p>Mary lived during the reign of Emperor Augustus and King Herod, in a time of Roman occupation of Israel. She was a young Jewish woman from Nazareth when chosen to be the mother of Jesus.</p>',
        theologicalSignificance: '<p>Mary represents the ideal of faithful obedience to God\'s will. Her willingness to accept God\'s plan despite potential social consequences demonstrates complete trust. She is honored as Theotokos ("God-bearer") and her Magnificat is one of the most beautiful expressions of praise in scripture.</p>',
        scriptures: [
            {
                reference: 'Luke 1:38',
                text: 'And Mary said, "Behold, I am the servant of the Lord; let it be to me according to your word." And the angel departed from her.'
            },
            {
                reference: 'Luke 1:46-55',
                text: 'And Mary said, "My soul magnifies the Lord, and my spirit rejoices in God my Savior, for he has looked on the humble estate of his servant. For behold, from now on all generations will call me blessed; for he who is mighty has done great things for me, and holy is his name. And his mercy is for those who fear him from generation to generation. He has shown strength with his arm; he has scattered the proud in the thoughts of their hearts; he has brought down the mighty from their thrones and exalted those of humble estate; he has filled the hungry with good things, and the rich he has sent away empty. He has helped his servant Israel, in remembrance of his mercy, as he spoke to our fathers, to Abraham and to his offspring forever."'
            }
        ],
        relationships: {
            'family': ['Jesus', 'Joseph'],
            'relatives': ['Elizabeth', 'Zechariah']
        },
        studyQuestions: [
            'What qualities made Mary the chosen vessel for the Messiah?',
            'How does Mary\'s Magnificat reveal her understanding of God?',
            'What can we learn from Mary\'s faithful response to God\'s call?'
        ]
    },
    {
        id: '3',
        name: 'Moses',
        description: 'Led the Israelites out of Egypt and received the Ten Commandments.',
        testament: 'old',
        book: 'Exodus',
        group: 'Prophets',
        img: 'https://images.unsplash.com/photo-1566193232556-d3fd467e1712?auto=format&fit=crop&w=150&q=80',
        openingLine: 'I have witnessed the power of the Lord. What would you like to know about God\'s deliverance?',
        historicalContext: '<p><strong>Time Period:</strong> Approximately 1500-1400 BCE</p><p><strong>Location:</strong> Egypt, Sinai Peninsula, Wilderness</p><p>Moses was born during a time when the Israelites were enslaved in Egypt. He was raised in Pharaoh\'s household but later fled to Midian. God called him to return to Egypt and lead the Israelites to freedom, beginning the Exodus journey.</p>',
        theologicalSignificance: '<p>Moses is the great lawgiver and mediator between God and Israel. Through him, God established the covenant relationship with Israel, gave the Law, and instituted the sacrificial system. Moses represents God\'s justice and mercy, demonstrating how God works through imperfect human leaders to accomplish divine purposes.</p>',
        scriptures: [
            {
                reference: 'Exodus 3:14',
                text: 'God said to Moses, "I AM WHO I AM." And he said, "Say this to the people of Israel: \'I AM has sent me to you.\'"'
            },
            {
                reference: 'Exodus 20:1-17',
                text: 'And God spoke all these words, saying, "I am the LORD your God, who brought you out of the land of Egypt, out of the house of slavery. You shall have no other gods before me..."'
            }
        ],
        relationships: {
            'family': ['Amram (father)', 'Jochebed (mother)', 'Miriam (sister)', 'Aaron (brother)'],
            'associates': ['Joshua', 'Caleb', 'Pharaoh']
        },
        studyQuestions: [
            'How did Moses\' upbringing in Egypt prepare him for his role as deliverer?',
            'What can we learn from Moses\' encounters with God at the burning bush and on Mount Sinai?',
            'How does Moses\' intercessory role prefigure Christ\'s mediation?'
        ]
    },
    {
        id: '4',
        name: 'David',
        description: 'Shepherd, psalmist and second king of Israel who defeated Goliath.',
        testament: 'old',
        book: '1 Samuel',
        group: 'Kings',
        img: 'https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?auto=format&fit=crop&w=150&q=80',
        openingLine: 'The Lord is my shepherd. How may I share the wisdom God has given me?',
        historicalContext: '<p><strong>Time Period:</strong> Approximately 1000 BCE</p><p><strong>Location:</strong> Bethlehem, Jerusalem, Wilderness of Judah</p><p>David rose from humble beginnings as a shepherd boy to become Israel\'s greatest king. He established Jerusalem as the capital and expanded Israel\'s territory. His reign is considered the golden age of ancient Israel.</p>',
        theologicalSignificance: '<p>David is the archetypal king of Israel and ancestor of the Messiah. His psalms form the heart of Jewish and Christian worship. Despite his moral failures, he exemplifies genuine repentance and faith. God\'s covenant with David established the promise of an eternal kingdom fulfilled in Jesus Christ.</p>',
        scriptures: [
            {
                reference: 'Psalm 23:1-6',
                text: 'The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name\'s sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me. You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows. Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever.'
            }
        ],
        relationships: {
            'family': ['Jesse (father)', 'Solomon (son)', 'Absalom (son)'],
            'friends': ['Jonathan'],
            'mentors': ['Samuel']
        },
        studyQuestions: [
            'What qualities made David "a man after God\'s own heart"?',
            'How did David\'s experiences as a shepherd influence his understanding of God?',
            'What can we learn from David\'s response to personal failure and sin?'
        ]
    },
    {
        id: '5',
        name: 'Paul',
        description: 'Apostle to the Gentiles and prolific New-Testament author.',
        testament: 'new',
        book: 'Acts',
        group: 'Apostles',
        img: 'https://images.unsplash.com/photo-1504275107627-0c2ba7a43dba?auto=format&fit=crop&w=150&q=80',
        openingLine: 'Grace to you and peace from God our Father. What spiritual matters shall we explore today?',
        historicalContext: '<p><strong>Time Period:</strong> New Testament Era</p><p><strong>Location:</strong> Tarsus, Jerusalem, Asia Minor, Greece, Rome</p><p>Born as Saul of Tarsus, Paul was a Roman citizen and educated Pharisee who initially persecuted Christians. After his dramatic conversion, he became the foremost missionary to the Gentiles, establishing churches throughout the Roman Empire.</p>',
        theologicalSignificance: '<p>Paul\'s writings form the theological foundation for much of Christian doctrine. His emphasis on salvation by grace through faith, the unity of believers, and the work of the Holy Spirit have profoundly shaped Christian theology. His missionary journeys established Christianity as a worldwide faith rather than a Jewish sect.</p>',
        scriptures: [
            {
                reference: 'Romans 8:38-39',
                text: 'For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers, nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.'
            }
        ],
        relationships: {
            'mentors': ['Gamaliel'],
            'companions': ['Barnabas', 'Silas', 'Timothy', 'Luke'],
            'converts': ['Lydia', 'Philippian Jailer']
        },
        studyQuestions: [
            'How did Paul\'s background as a Pharisee influence his understanding of Christ?',
            'What is the significance of Paul\'s teaching on justification by faith?',
            'How did Paul balance grace and obedience in his teachings?'
        ]
    }
];

// Execute on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCharacterSelection();
});

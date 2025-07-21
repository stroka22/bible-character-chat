/**
 * Bible Character Chat App Fixes
 * This file contains fixes for two specific issues:
 * 1. Filter chip removal functionality
 * 2. Character selection click events
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix 1: Proper filter chip removal
    function fixFilterChipRemoval() {
        // Get references to filter elements
        const activeFilterEl = document.getElementById('activeFilters');
        const testamentBtns = [...document.querySelectorAll('.testament-filter')];
        const bookSel = document.getElementById('book');
        const groupSel = document.getElementById('group');
        const alphaLinks = [...document.querySelectorAll('.alpha-link')];
        const searchInput = document.getElementById('search');

        // Function to render active filter chips properly
        function renderActiveChips() {
            // Clear all existing content first
            activeFilterEl.innerHTML = '';
            
            // Add the label
            const label = document.createElement('span');
            label.style.color = '#a0a0a0';
            label.style.marginRight = '8px';
            label.textContent = 'Active Filters:';
            activeFilterEl.appendChild(label);
            
            // Track if we have any active filters
            let hasActiveFilters = false;
            
            // Add filter chips with proper event listeners
            const addChip = (text, filterKey, filterValue) => {
                hasActiveFilters = true;
                const chip = document.createElement('div');
                chip.className = 'filter-chip';
                chip.innerHTML = `<span>${text}</span><span class="remove">×</span>`;
                
                // Add event listener directly to the remove button
                const removeBtn = chip.querySelector('.remove');
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent event bubbling
                    
                    // Reset the filter to its default value
                    if (filterKey === 'search') {
                        window.filters.search = '';
                        searchInput.value = '';
                    } else if (filterKey === 'testament') {
                        window.filters.testament = 'all';
                        testamentBtns.forEach(btn => {
                            btn.classList.toggle('active', btn.getAttribute('data-testament') === 'all');
                        });
                    } else if (filterKey === 'book') {
                        window.filters.book = 'all';
                        bookSel.value = 'all';
                    } else if (filterKey === 'group') {
                        window.filters.group = 'all';
                        groupSel.value = 'all';
                    } else if (filterKey === 'letter') {
                        window.filters.letter = 'All';
                        alphaLinks.forEach(a => {
                            a.classList.toggle('active', a.getAttribute('data-letter') === 'All');
                        });
                    }
                    
                    // Re-render the UI
                    renderActiveChips();
                    
                    // Trigger filter application and character rendering
                    if (typeof window.applyFilters === 'function' && typeof window.renderCharacters === 'function') {
                        const filtered = window.applyFilters();
                        window.renderCharacters(filtered);
                    }
                });
                
                activeFilterEl.appendChild(chip);
            };
            
            // Add chips for each active filter
            if (window.filters.search) {
                addChip(`"${window.filters.search}"`, 'search', window.filters.search);
            }
            if (window.filters.testament !== 'all') {
                addChip(window.filters.testament === 'old' ? 'Old Testament' : 'New Testament', 'testament', window.filters.testament);
            }
            if (window.filters.book !== 'all') {
                addChip(`Book: ${window.filters.book}`, 'book', window.filters.book);
            }
            if (window.filters.group !== 'all') {
                addChip(`Group: ${window.filters.group}`, 'group', window.filters.group);
            }
            if (window.filters.letter !== 'All') {
                addChip(`Starts with "${window.filters.letter}"`, 'letter', window.filters.letter);
            }
            
            // If no active filters, show a message
            if (!hasActiveFilters) {
                const noFilters = document.createElement('span');
                noFilters.style.color = 'var(--text-dimmer)';
                noFilters.textContent = 'No active filters';
                activeFilterEl.appendChild(noFilters);
            }
        }

        // Replace the existing renderActiveChips function
        window.renderActiveChips = renderActiveChips;
        
        // Initial render of active chips
        renderActiveChips();
        
        console.log('Filter chip removal functionality fixed');
    }

    // Fix 2: Character selection click events
    function fixCharacterSelection() {
        // Get references to relevant elements
        const characterSelectionView = document.getElementById('characterSelectionView');
        const chatView = document.getElementById('chatView');
        const chatMain = document.getElementById('chatMain');
        const chatMessages = document.getElementById('chatMessages');
        const chatHeaderImage = document.getElementById('chatHeaderImage');
        const chatHeaderName = document.getElementById('chatHeaderName');
        const insightsAvatar = document.getElementById('insightsAvatar');
        const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
        const relationshipsSection = document.getElementById('relationshipsSection')?.querySelector('.section-content');
        
        // Function to properly handle character selection
        function selectCharacter(character) {
            if (!character) {
                console.error('No character data provided');
                return;
            }
            
            console.log('Selecting character:', character.name);
            
            // Update chat view with character data
            chatHeaderImage.src = character.img || '';
            chatHeaderName.textContent = `Chat with ${character.name}`;
            breadcrumbCurrent.textContent = character.name;
            
            if (insightsAvatar) {
                insightsAvatar.src = character.img || '';
                insightsAvatar.alt = character.name;
            }
            
            // Clear previous messages and add opening line
            chatMessages.innerHTML = '';
            const openingMessage = document.createElement('div');
            openingMessage.className = 'message-bubble character-message';
            openingMessage.textContent = character.openingLine || `Hello, I am ${character.name}. How can I help you?`;
            chatMessages.appendChild(openingMessage);
            
            // Populate relationships if available
            if (relationshipsSection && character.relationships) {
                relationshipsSection.innerHTML = '';
                
                Object.keys(character.relationships).forEach(group => {
                    const relationshipGroup = document.createElement('div');
                    relationshipGroup.className = 'relationship-group';
                    
                    const groupTitle = document.createElement('h5');
                    groupTitle.textContent = group.charAt(0).toUpperCase() + group.slice(1);
                    relationshipGroup.appendChild(groupTitle);
                    
                    character.relationships[group].forEach(relation => {
                        const chip = document.createElement('span');
                        chip.className = 'relationship-chip';
                        chip.textContent = relation;
                        relationshipGroup.appendChild(chip);
                    });
                    
                    relationshipsSection.appendChild(relationshipGroup);
                });
            }
            
            // Store current character
            window.currentCharacter = character;
            
            // Switch views
            characterSelectionView.classList.add('hidden');
            chatView.classList.add('active');
        }
        
        // Attach event listeners to all character selection elements
        function attachSelectionListeners() {
            // Featured character button
            const featuredCharacterBtn = document.querySelector('.featured-character button');
            if (featuredCharacterBtn) {
                featuredCharacterBtn.addEventListener('click', function() {
                    const characterName = this.getAttribute('data-character');
                    const character = characters.find(c => c.name === characterName);
                    if (character) {
                        selectCharacter(character);
                    } else {
                        console.error('Character not found:', characterName);
                    }
                });
            }
            
            // Attach listeners to dynamically created character cards and list items
            document.addEventListener('click', function(e) {
                // Check if clicked element is a character card or within one
                const card = e.target.closest('.character-card, .character-list-item');
                if (card) {
                    const characterName = card.getAttribute('data-character');
                    if (characterName) {
                        const character = characters.find(c => c.name === characterName);
                        if (character) {
                            selectCharacter(character);
                        } else {
                            console.error('Character not found:', characterName);
                        }
                    }
                }
                
                // Check for select-character buttons
                if (e.target.classList.contains('select-character')) {
                    const characterName = e.target.getAttribute('data-character');
                    if (characterName) {
                        const character = characters.find(c => c.name === characterName);
                        if (character) {
                            selectCharacter(character);
                        } else {
                            console.error('Character not found:', characterName);
                        }
                    }
                }
            });
            
            // Back button in chat view
            const backBtn = document.getElementById('backBtn');
            if (backBtn) {
                backBtn.addEventListener('click', function() {
                    chatView.classList.remove('active');
                    characterSelectionView.classList.remove('hidden');
                    // Close insights panel if open
                    if (insightsPanel) {
                        insightsPanel.classList.remove('open');
                        chatMain.classList.remove('panel-open');
                    }
                });
            }
        }
        
        // Make the selectCharacter function available globally
        window.selectCharacter = selectCharacter;
        
        // Attach all listeners
        attachSelectionListeners();
        
        console.log('Character selection functionality fixed');
    }

    // Apply both fixes
    fixFilterChipRemoval();
    fixCharacterSelection();
    
    console.log('App fixes applied successfully');
});

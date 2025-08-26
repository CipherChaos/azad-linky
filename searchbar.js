// Search functionality for course cards
document.addEventListener('DOMContentLoaded', function() {
    console.log('Search script loaded'); // Debug log
    
    const searchInput = document.getElementById('courseSearch');
    const clearButton = document.querySelector('.search-clear');
    const courseCards = document.querySelectorAll('.course-card');
    
    // Debug logs
    console.log('Search input:', searchInput);
    console.log('Clear button:', clearButton);
    console.log('Course cards found:', courseCards.length);

    // Check if elements exist
    if (!searchInput) {
        console.error('Search input not found');
        return;
    }
    
    if (!clearButton) {
        console.error('Clear button not found');
        return;
    }
    
    if (courseCards.length === 0) {
        console.error('No course cards found');
        return;
    }

    // Initially hide the clear button
    clearButton.style.display = 'none';

    // Search function
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        console.log('Searching for:', searchTerm); // Debug log
        let hasVisibleCards = false;

        courseCards.forEach(card => {
            const courseTitle = card.querySelector('.course-title').textContent.toLowerCase();
            const instructorBadges = card.querySelectorAll('.instructor-badge');
            
            // Create a string of all instructor names for this course
            let instructorNames = '';
            instructorBadges.forEach(badge => {
                instructorNames += badge.textContent.toLowerCase() + ' ';
            });

            // Check if search term matches course title or any instructor name
            const matchesTitle = courseTitle.includes(searchTerm);
            const matchesInstructor = instructorNames.includes(searchTerm);

            if (searchTerm === '' || matchesTitle || matchesInstructor) {
                card.style.display = 'block';
                hasVisibleCards = true;
                
                // Add subtle highlight effect for matching terms
                if (searchTerm !== '') {
                    card.classList.add('search-match');
                } else {
                    card.classList.remove('search-match');
                }
            } else {
                card.style.display = 'none';
                card.classList.remove('search-match');
            }
        });

        // Show "no results" message if no cards are visible (optional)
        showNoResultsMessage(!hasVisibleCards && searchTerm !== '');
    }

    // Show/hide no results message
    function showNoResultsMessage(show) {
        let noResultsMsg = document.querySelector('.no-results-message');
        
        if (show && !noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.style.textAlign = 'center';
            noResultsMsg.style.padding = '2rem';
            noResultsMsg.style.color = '#ee1414ff';
            noResultsMsg.style.fontSize = '1.1rem';
            noResultsMsg.innerHTML = `
                <p>هیچ درسی پیدا نشد</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">لطفاً عبارت جستجوی خود را بررسی کنید</p>
            `;
            document.querySelector('.courses-grid').appendChild(noResultsMsg);
        } else if (!show && noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    // Clear search function
    function clearSearch() {
        searchInput.value = '';
        searchInput.focus();
        performSearch();
        toggleClearButton();
    }

    // Toggle clear button visibility
    function toggleClearButton() {
        if (searchInput.value.trim().length > 0) {
            clearButton.style.display = 'flex';
        } else {
            clearButton.style.display = 'none';
        }
    }

    // Event listeners
    searchInput.addEventListener('input', function() {
        performSearch();
        toggleClearButton();
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearSearch();
        }
    });

    clearButton.addEventListener('click', clearSearch);

    // Focus search input when user presses Ctrl+F or Cmd+F (optional enhancement)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // Add some CSS for search highlighting (inject into head)
    const style = document.createElement('style');
    style.textContent = `
        .search-match {
            transform: scale(1.02);
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
            
        }
        
        .search-clear {
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: background-color 0.2s ease;
        }
        
        .search-clear:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
        
        .search-clear svg {
            width: 16px;
            height: 16px;
            color: #666;
        }
        
        .no-results-message {
            grid-column: 1 / -1;
            background: rgba(2, 1, 1, 0.5);
            border-radius: 12px;
            
        }
        
        @media (max-width: 768px) {
            .search-match {
                transform: none;
            }
        }
    `;
    document.head.appendChild(style);
});

// Global function to clear search (called from HTML onclick)
function clearSearch() {
    const searchInput = document.getElementById('courseSearch');
    const clearButton = document.querySelector('.search-clear');
    
    searchInput.value = '';
    searchInput.focus();
    
    // Trigger input event to perform search
    searchInput.dispatchEvent(new Event('input'));
}
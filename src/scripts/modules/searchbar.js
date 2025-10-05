// Global Course Search System - Fixed Version
class GlobalCourseSearch {
    constructor() {
        this.allCourses = [];
        this.coursesLoaded = false;
        this.isLoading = false;
        this.init();
    }

    async init() {
        await this.loadAllCourses();
        this.setupSearchFunctionality();
    }

    // Load all courses from single JSON file
    async loadAllCourses() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            // Show loading indicator
            this.showLoadingState();

            const response = await fetch('./public/data.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load data.json: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Process the data structure
            this.allCourses = this.processCoursesData(data);
            this.coursesLoaded = true;
            
            // Hide loading state
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
        }
    }

    // Process courses data based on structure
    processCoursesData(data) {
        let allCourses = [];

        // Handle different possible data structures
        if (data.courses && Array.isArray(data.courses)) {
            // Structure: { courses: [...] }
            allCourses = data.courses;
        } else if (Array.isArray(data)) {
            // Structure: [...]
            allCourses = data;
        } else if (typeof data === 'object') {
            // Structure with categories: { main: [...], general: [...], ... }
            const categoryMappings = {
                'main': { type: 'main', page: './src/templates/courses/courses-main.html' },
                'general': { type: 'general', page: './src/templates/courses/courses-general.html' },
                'lab': { type: 'lab', page: './src/templates/courses/courses-lab.html' },
                'fundamental': { type: 'fundamental', page: './src/templates/courses/courses-fundamental.html' },
                'languages': { type: 'languages', page: './src/templates/courses/courses-languages.html' },
                'practical': { type: 'practical', page: './src/templates/courses/courses-practical.html' }
            };

            Object.keys(data.courses).forEach(categoryKey => {
                if (Array.isArray(data.courses[categoryKey])) {
                    const categoryInfo = categoryMappings[categoryKey] || { 
                        type: categoryKey, 
                        page: `./src/templates/courses/courses-${categoryKey}.html` 
                    };

                    data.courses[categoryKey].forEach(course => {
                        allCourses.push({
                            ...course,
                            category: categoryInfo.type,
                            categoryPage: categoryInfo.page,
                            id: course.id || course.code || `${categoryInfo.type}-${Math.random()}`
                        });
                    });
                }
            });
        }

        // If courses don't have category info, assign default
        return allCourses.map(course => ({
            ...course,
            category: course.category || 'main',
            categoryPage: course.categoryPage || './src/templates/courses/courses-main.html',
            id: course.id || course.code || `course-${Math.random()}`
        }));
    }

    // Show loading state
    showLoadingState() {
        const coursesGrid = document.querySelector('.courses-grid');
        if (!coursesGrid) return;

        // Remove any existing messages first
        this.clearAllMessages();

        // Hide category cards
        const categoryCards = coursesGrid.querySelectorAll('.course-card:not(.search-result-card)');
        categoryCards.forEach(card => card.style.display = 'none');

        // Show loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>در حال بارگیری دروس...</p>
            </div>
        `;
        coursesGrid.appendChild(loadingMsg);
    }

    // Hide loading state
    hideLoadingState() {
        this.clearAllMessages();
        this.showCategoryCards();
    }

    // Show error state
    showErrorState() {
}

    // FIXED: Show no results message - this was the main issue!
    showNoResultsMessage(show = true) {
        const coursesGrid = document.querySelector('.courses-grid');
        if (!coursesGrid) return;

        // CRITICAL FIX: Clear ALL messages first, including no-results-message
        this.clearAllMessages();

        if (show) {
            const noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message'; // Fixed: use consistent class name
            noResultsMsg.innerHTML = `
                <div class="error-content">
                    <div class="error-icon">❌</div>
                    <h3>هیچ درسی پیدا نشد</h3>
                    <p>لطفاً عبارت جستجوی خود را بررسی کنید یا کلمه کلیدی دیگری امتحان کنید</p>
                </div>
            `;
            coursesGrid.appendChild(noResultsMsg);
        }
    }

    // FIXED: Clear all messages properly
    clearAllMessages() {
        const coursesGrid = document.querySelector('.courses-grid');
        if (!coursesGrid) return;

        // Remove ALL message types with a single query
        const messages = coursesGrid.querySelectorAll('.loading-message, .error-message, .no-results-message');
        messages.forEach(message => message.remove());
    }

    // Setup search functionality
    setupSearchFunctionality() {
        const searchInput = document.getElementById('courseSearch');
        const clearButton = document.querySelector('.search-clear');

        if (!searchInput) {
            console.error('Search input not found');
            return;
        }

        // Create clear button if it doesn't exist
        if (!clearButton) {
            const searchWrapper = searchInput.closest('.search-wrapper');
            if (searchWrapper) {
                const newClearButton = document.createElement('button');
                newClearButton.className = 'search-clear';
                newClearButton.type = 'button';
                newClearButton.style.display = 'none';
                newClearButton.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                `;
                searchWrapper.appendChild(newClearButton);
            }
        }

        const clearBtn = document.querySelector('.search-clear');

        // Determine page type
        const isIndexPage = this.isIndexPage();
        
        if (isIndexPage) {
            this.setupGlobalSearch(searchInput, clearBtn);
        } else {
            this.setupLocalSearch(searchInput, clearBtn);
        }

        // Common event listeners
        this.setupCommonEventListeners(searchInput, clearBtn);
    }

    // Check if current page is index page
    isIndexPage() {
        const path = window.location.pathname;
        return path === '/' || 
               path.includes('index.html') || 
               path === '' ||
               path.endsWith('/');
    }

    // Setup global search for index page
    setupGlobalSearch(searchInput, clearButton) {
    
        searchInput.addEventListener('input', (e) => {
            this.performGlobalSearch();
            this.toggleClearButton(searchInput, clearButton);
        });

        // Also trigger search on Enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performGlobalSearch();
            }
        });
    }

    // Setup local search for course pages
    setupLocalSearch(searchInput, clearButton) {
        
        searchInput.addEventListener('input', () => {
            this.performLocalSearch();
            this.toggleClearButton(searchInput, clearButton);
        });
    }

    // FIXED: Global search that shows results from all categories
    performGlobalSearch() {
        const searchInput = document.getElementById('courseSearch');
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!this.coursesLoaded) {
            if (!this.isLoading) {
                this.loadAllCourses();
            }
            return;
        }

        if (searchTerm === '') {
            this.showCategoryCards();
            return;
        }

        // Filter courses based on search term
        const matchedCourses = this.allCourses.filter(course => {
            const titleMatch = course.title?.toLowerCase().includes(searchTerm);
            const instructorMatch = course.instructors?.some(instructor => 
                instructor.name.toLowerCase().includes(searchTerm)
            );
            const codeMatch = course.code?.toLowerCase().includes(searchTerm);
            const descriptionMatch = course.description?.toLowerCase().includes(searchTerm);
            
            return titleMatch || instructorMatch || codeMatch || descriptionMatch;
        });

        // CRITICAL FIX: Clear all messages before showing results or no-results
        this.clearAllMessages();

        if (matchedCourses.length > 0) {
            this.displaySearchResults(matchedCourses);
        } else {
            // Hide category cards when showing no results
            const coursesGrid = document.querySelector('.courses-grid');
            if (coursesGrid) {
                const categoryCards = coursesGrid.querySelectorAll('.course-card:not(.search-result-card)');
                categoryCards.forEach(card => card.style.display = 'none');
                
                // Remove existing search results
                const existingResults = coursesGrid.querySelectorAll('.search-result-card, .search-category-header');
                existingResults.forEach(element => element.remove());
            }
            
            this.showNoResultsMessage(true);
        }
    }

    // FIXED: Local search for individual course pages
    performLocalSearch() {
        const searchInput = document.getElementById('courseSearch');
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        const courseCards = document.querySelectorAll('.course-card');
        let hasVisibleCards = false;

        courseCards.forEach(card => {
            const courseTitle = card.querySelector('.course-title');
            const instructorBadges = card.querySelectorAll('.instructor-badge');
            const courseCode = card.querySelector('.course-code');
            
            if (!courseTitle) return;
            
            const courseTitleText = courseTitle.textContent.toLowerCase();
            const courseCodeText = courseCode ? courseCode.textContent.toLowerCase() : '';
            
            let instructorNames = '';
            instructorBadges.forEach(badge => {
                instructorNames += badge.textContent.toLowerCase() + ' ';
            });

            const matchesTitle = courseTitleText.includes(searchTerm);
            const matchesInstructor = instructorNames.includes(searchTerm);
            const matchesCode = courseCodeText.includes(searchTerm);

            if (searchTerm === '' || matchesTitle || matchesInstructor || matchesCode) {
                card.style.display = 'block';
                hasVisibleCards = true;
                
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

        // FIXED: Only call showNoResultsMessage once, and clear messages first
        const shouldShowNoResults = !hasVisibleCards && searchTerm !== '';
        this.showNoResultsMessage(shouldShowNoResults);
    }

    // FIXED: Display search results on index page
    displaySearchResults(courses) {
        const coursesGrid = document.querySelector('.courses-grid');
        if (!coursesGrid) return;

        // CRITICAL: Clear all messages first to prevent duplicates
        this.clearAllMessages();

        // Hide category cards
        const categoryCards = coursesGrid.querySelectorAll('.course-card:not(.search-result-card)');
        categoryCards.forEach(card => {
            card.style.display = 'none';
        });

        // Remove existing search results
        const existingResults = coursesGrid.querySelectorAll('.search-result-card, .search-category-header');
        existingResults.forEach(element => element.remove());

        // Group courses by category
        const groupedCourses = {};
        courses.forEach(course => {
            if (!groupedCourses[course.category]) {
                groupedCourses[course.category] = [];
            }
            groupedCourses[course.category].push(course);
        });

        // Display results grouped by category
        Object.entries(groupedCourses).forEach(([category, coursesInCategory]) => {
            // Add category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'search-category-header';
            categoryHeader.innerHTML = `
                <h3 class="category-title">${this.getCategoryTitle(category)}</h3>
                <span class="course-count">${coursesInCategory.length} درس</span>
            `;
            coursesGrid.appendChild(categoryHeader);

            // Add courses
            coursesInCategory.forEach(course => {
                const courseCard = this.createSearchResultCard(course);
                coursesGrid.appendChild(courseCard);
            });
        });
    }

    // Create a search result card
    createSearchResultCard(course) {
        const card = document.createElement('article');
        card.className = 'course-card search-result-card';
        
        const instructorBadges = course.instructors ? 
            course.instructors.map(instructor => 
                `<span class="instructor-badge">${instructor.name}</span>`
            ).join('') : '';

        card.innerHTML = `
            <div class="course-header">
                <div class="course-code course-${course.category}">${course.code || ''}</div>
                <div class="course-meta">
                    <a href="${course.categoryPage}" class="category-link">
                        ${this.getCategoryTitle(course.category)}
                    </a>
                </div>
            </div>
            <div class="course-content">
                <h3 class="course-title">${course.title}</h3>
                ${course.credits ? `<p class="course-credits">${course.credits} واحد</p>` : ''}
                ${instructorBadges ? `<div class="instructor-list">${instructorBadges}</div>` : ''}
                ${course.description ? `<p class="course-description">${course.description}</p>` : ''}
            </div>
        `;

        // Add click handler to navigate to course page
        card.addEventListener('click', (e) => {
            e.preventDefault();
            // Store the course ID for highlighting on the target page
            sessionStorage.setItem('highlightCourse', course.id || course.code);
            sessionStorage.setItem('searchTerm', document.getElementById('courseSearch').value);
            window.location.href = course.categoryPage;
        });

        return card;
    }

    // Get category title in Persian
    getCategoryTitle(category) {
        const titles = {
            'main': 'دروس اصلی',
            'general': 'دروس عمومی',
            'lab': 'دروس آزمایشگاهی',
            'fundamental': 'دروس پایه',
            'languages': 'دروس زبان',
            'practical': 'دروس عملی'
        };
        return titles[category] || category;
    }

    // FIXED: Show original category cards
    showCategoryCards() {
        const coursesGrid = document.querySelector('.courses-grid');
        if (!coursesGrid) return;

        // Clear all messages first to prevent conflicts
        this.clearAllMessages();

        // Show category cards
        const categoryCards = coursesGrid.querySelectorAll('.course-card:not(.search-result-card)');
        categoryCards.forEach(card => {
            card.style.display = 'block';
        });

        // Remove search results
        const searchResults = coursesGrid.querySelectorAll('.search-result-card, .search-category-header');
        searchResults.forEach(element => element.remove());
    }

    // Setup common event listeners
    setupCommonEventListeners(searchInput, clearButton) {
        if (!clearButton) return;

        // Clear search function
        const clearSearch = () => {
            searchInput.value = '';
            searchInput.focus();
            
            // Trigger appropriate search
            if (this.isIndexPage()) {
                this.showCategoryCards();
            } else {
                this.performLocalSearch();
            }
            
            this.toggleClearButton(searchInput, clearButton);
        };

        // Event listeners
        clearButton.addEventListener('click', clearSearch);

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                clearSearch();
            }
        });

        // Global shortcut for search focus
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    // Toggle clear button visibility
    toggleClearButton(searchInput, clearButton) {
        if (!clearButton) return;
        
        if (searchInput.value.trim().length > 0) {
            clearButton.style.display = 'flex';
        } else {
            clearButton.style.display = 'none';
        }
    }
}

// Course page enhancement for highlighting searched courses
class CoursePageEnhancer {
    constructor() {
        this.init();
    }

    init() {
        // Check if we need to highlight a specific course
        const highlightCourseId = sessionStorage.getItem('highlightCourse');
        const searchTerm = sessionStorage.getItem('searchTerm');
        
        if (highlightCourseId) {
            this.highlightCourse(highlightCourseId);
            sessionStorage.removeItem('highlightCourse');
        }
        
        if (searchTerm) {
            const searchInput = document.getElementById('courseSearch');
            if (searchInput) {
                searchInput.value = searchTerm;
                // Trigger local search to show filtered results
                const globalSearch = new GlobalCourseSearch();
                setTimeout(() => globalSearch.performLocalSearch(), 500);
            }
            sessionStorage.removeItem('searchTerm');
        }
    }

    highlightCourse(courseId) {
        // Wait for course cards to load
        setTimeout(() => {
            const courseCards = document.querySelectorAll('.course-card');
            courseCards.forEach(card => {
                const courseTitle = card.querySelector('.course-title');
                const courseCode = card.querySelector('.course-code');
                
                if (courseTitle && (
                    courseTitle.textContent.includes(courseId) ||
                    (courseCode && courseCode.textContent.includes(courseId))
                )) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.classList.add('highlighted-course');
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        card.classList.remove('highlighted-course');
                    }, 3000);
                }
            });
        }, 500);
    }
}

// Initialize the appropriate system based on the page
document.addEventListener('DOMContentLoaded', () => {

    // Initialize global search system
    window.globalSearch = new GlobalCourseSearch();
    
    // Initialize course page enhancer for non-index pages
    if (!window.globalSearch.isIndexPage()) {
        new CoursePageEnhancer();
    }
});

// Global function for clear search (if needed by HTML)
function clearSearch() {
    const searchInput = document.getElementById('courseSearch');
    if (searchInput) {
        searchInput.value = '';
        const event = new Event('input');
        searchInput.dispatchEvent(event);
        searchInput.focus();
    }
}

class ResponsiveNavbar {
    constructor() {
        this.menuToggle = document.getElementById('responsive-menu');
        this.menuItems = document.querySelectorAll('.header__menuItem a');
        this.body = document.body;
        
        this.init();
    }

    init() {
        // Close menu when clicking on menu items (mobile)
        this.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 800) {
                    this.closeMenu();
                }
            });
        });

        // Close menu when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 800) {
                const nav = document.querySelector('.header__nav');
                const isClickInsideNav = nav.contains(e.target);
                
                if (!isClickInsideNav && this.menuToggle.checked) {
                    this.closeMenu();
                }
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menuToggle.checked) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 800 && this.menuToggle.checked) {
                this.closeMenu();
            }
        });

        // Prevent body scroll when menu is open
        this.menuToggle.addEventListener('change', () => {
            if (this.menuToggle.checked) {
                this.body.style.overflow = 'hidden';
            } else {
                this.body.style.overflow = '';
            }
        });

        // Add keyboard navigation
        this.addKeyboardNavigation();
    }

    closeMenu() {
        this.menuToggle.checked = false;
        this.body.style.overflow = '';
    }

    addKeyboardNavigation() {
        const toggleLabel = document.querySelector('.toggle-menu');
        
        // Handle Enter and Space for toggle
        toggleLabel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.menuToggle.click();
            }
        });

        // Tab navigation within open menu
        this.menuItems.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && this.menuToggle.checked) {
                    // If we're at the last item and pressing Tab (not Shift+Tab)
                    if (index === this.menuItems.length - 1 && !e.shiftKey) {
                        e.preventDefault();
                        toggleLabel.focus();
                    }
                    // If we're at the first item and pressing Shift+Tab
                    else if (index === 0 && e.shiftKey) {
                        e.preventDefault();
                        toggleLabel.focus();
                    }
                }
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResponsiveNavbar();
});

// Smooth scrolling for anchor links (if any)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
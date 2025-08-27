// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
const toggleButton = document.getElementById('theme-toggle');
const themeStatusText = document.getElementById('theme-status-text');
const autoIndicator = document.getElementById('auto-indicator');
const root = document.documentElement;

// Load saved theme on page load
const savedTheme = localStorage.getItem('theme') || 'auto';

// Apply initial theme
applyTheme(savedTheme);
updateToggleState(savedTheme);

// Function to apply theme
function applyTheme(theme) {
    // Remove existing theme attributes
    root.removeAttribute('data-theme');
    
    if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        root.style.setProperty('color-scheme', 'light');
        themeStatusText.textContent = 'Light';
        autoIndicator.textContent = '';
    } else if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        root.style.setProperty('color-scheme', 'dark');
        themeStatusText.textContent = 'Dark';
        autoIndicator.textContent = '';
    } else { // auto
        // Don't set data-theme, let CSS media queries handle it
        root.style.setProperty('color-scheme', 'light dark');
        // Show system preference in auto mode
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeStatusText.textContent = 'Auto';
        
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Dispatch event for other components to listen to
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
}

// Update toggle state based on theme
function updateToggleState(theme) {
    if (theme === 'light') {
        toggleButton.checked = false;
    } else if (theme === 'dark') {
        toggleButton.checked = true;
    } else { // auto - determine based on system preference
        toggleButton.checked = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}

// Toggle function
toggleButton.addEventListener('change', () => {
    const currentTheme = localStorage.getItem('theme') || 'auto';
    let newTheme;
    
    // Cycle through: auto -> light -> dark -> auto
    if (currentTheme === 'auto') {
        newTheme = 'light';
    } else if (currentTheme === 'light') {
        newTheme = 'dark';
    } else {
        newTheme = 'auto';
    }
    
    applyTheme(newTheme);
    
    // Update toggle state after a short delay to show the transition
    setTimeout(() => {
        updateToggleState(newTheme);
    }, 100);
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'auto') {
        applyTheme('auto'); // Re-apply auto theme to reflect system change
        updateToggleState('auto');
    }
});

// Simulate navigation to show theme persistence
document.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        alert('In a real application, you would navigate to another page. ' +
                'On this demo, notice how the theme persists even after this alert. ' +
                'Your theme preference is saved in localStorage and will work across all pages.');
    });
});
});
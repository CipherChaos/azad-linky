// Connection-based loading script
document.addEventListener('DOMContentLoaded', function() {
    // Create loader element
    const loader = document.createElement('div');
    loader.id = 'loader';
    document.body.appendChild(loader);

    // Loading state management
    let isContentLoaded = false;
    let isConnectionGood = false;
    let minimumLoadTime = 1000; // Minimum 1 second loading time
    let startTime = Date.now();

    // Check network connection
    function checkConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const effectiveType = connection.effectiveType;
            
            // Determine if connection is good enough
            // 4g, 3g are considered good, 2g and slow-2g need more time
            switch(effectiveType) {
                case '4g':
                    isConnectionGood = true;
                    minimumLoadTime = 800;
                    break;
                case '3g':
                    isConnectionGood = true;
                    minimumLoadTime = 1200;
                    break;
                case '2g':
                    isConnectionGood = false;
                    minimumLoadTime = 2500;
                    break;
                case 'slow-2g':
                    isConnectionGood = false;
                    minimumLoadTime = 4000;
                    break;
                default:
                    isConnectionGood = true;
                    minimumLoadTime = 1000;
            }
            
            console.log(`Connection type: ${effectiveType}, Minimum load time: ${minimumLoadTime}ms`);
        } else {
            // Fallback: Test connection speed manually
            testConnectionSpeed();
        }
    }

    // Manual connection speed test (fallback)
    function testConnectionSpeed() {
        const startTime = Date.now();
        const img = new Image();
        
        img.onload = function() {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            if (duration < 200) {
                // Fast connection
                isConnectionGood = true;
                minimumLoadTime = 800;
            } else if (duration < 500) {
                // Medium connection
                isConnectionGood = true;
                minimumLoadTime = 1200;
            } else {
                // Slow connection
                isConnectionGood = false;
                minimumLoadTime = 2500;
            }
            
            console.log(`Connection test: ${duration}ms, Minimum load time: ${minimumLoadTime}ms`);
            checkIfReadyToHide();
        };
        
        img.onerror = function() {
            // Very slow or no connection
            isConnectionGood = false;
            minimumLoadTime = 3000;
            console.log('Connection test failed, using slow connection settings');
            checkIfReadyToHide();
        };
        
        // Use a small image for testing (1x1 pixel)
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7?' + Math.random();
    }

    // Check if all resources are loaded
    function checkResourcesLoaded() {
        // Check if all images are loaded
        const images = document.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            return new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.addEventListener('load', resolve);
                    img.addEventListener('error', resolve); // Resolve even on error
                }
            });
        });

        // Check if all stylesheets are loaded
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const stylesheetPromises = Array.from(stylesheets).map(link => {
            return new Promise((resolve) => {
                if (link.sheet) {
                    resolve();
                } else {
                    link.addEventListener('load', resolve);
                    link.addEventListener('error', resolve);
                }
            });
        });

        // Wait for all resources
        Promise.all([...imagePromises, ...stylesheetPromises]).then(() => {
            isContentLoaded = true;
            console.log('All resources loaded');
            checkIfReadyToHide();
        });
    }

    // Check if ready to hide loader
    function checkIfReadyToHide() {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
        
        if (isContentLoaded && elapsedTime >= minimumLoadTime) {
            hideLoader();
        } else {
            // Wait for remaining time or content to load
            setTimeout(() => {
                if (isContentLoaded || Date.now() - startTime >= minimumLoadTime * 2) {
                    hideLoader();
                }
            }, remainingTime);
        }
    }

    // Hide loader with smooth transition
    function hideLoader() {
        const loaderElement = document.getElementById('loader');
        if (loaderElement) {
            // Add fade out transition
            loaderElement.style.transition = 'opacity 0.5s ease-out, visibility 0.5s ease-out';
            loaderElement.style.opacity = '0';
            loaderElement.style.visibility = 'hidden';
            
            
            document.body.classList.remove('loading');
            loadingOverlay.classList.add('hidden');
            document.getElementById('loading-wrapper').style.display = 'none';
            mainContent.classList.add('visible');
            
            // Remove from DOM after transition
            setTimeout(() => {
                if (loaderElement.parentNode) {
                    loaderElement.parentNode.removeChild(loaderElement);
                }
                // Re-enable body scroll
                document.body.style.overflow = '';
                console.log('Loading complete');
            }, 500);
        }
    }

    // Monitor connection changes
    if ('connection' in navigator) {
        navigator.connection.addEventListener('change', function() {
            console.log('Connection changed:', navigator.connection.effectiveType);
            if (!isContentLoaded) {
                checkConnection();
            }
        });
    }

    // Initialize
    checkConnection();
    
    // Start checking resources after a short delay to ensure DOM is ready
    setTimeout(() => {
        checkResourcesLoaded();
    }, 100);

    // Fallback: Force hide after maximum time (prevent infinite loading)
    const maxLoadTime = 10000; // 10 seconds maximum
    setTimeout(() => {
        if (document.getElementById('loader')) {
            console.log('Force hiding loader after maximum time');
            hideLoader();
        }
    }, maxLoadTime);

    // Listen for page visibility changes (user switching tabs)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible' && !isContentLoaded) {
            // Re-check connection when user returns to tab
            checkConnection();
        }
    });
});

// Optional: Provide global functions for manual control
window.showLoader = function() {
    if (!document.getElementById('loader')) {
        const loader = document.createElement('div');
        loader.id = 'loader';
        document.body.appendChild(loader);
        document.body.style.overflow = 'hidden';
    }
};

window.hideLoader = function() {
    const loaderElement = document.getElementById('loader');
    if (loaderElement) {
        loaderElement.style.transition = 'opacity 0.5s ease-out, visibility 0.5s ease-out';
        loaderElement.style.opacity = '0';
        loaderElement.style.visibility = 'hidden';
        
        setTimeout(() => {
            if (loaderElement.parentNode) {
                loaderElement.parentNode.removeChild(loaderElement);
            }
            document.body.style.overflow = '';
        }, 500);
      
        
        
    }
};
document.addEventListener('DOMContentLoaded', function() {
    
    document.body.style.overflow = 'hidden';

    
    let isContentLoaded = false;
    let isConnectionGood = false;
    let minimumLoadTime = 1000; 
    let startTime = Date.now();

    
    function checkConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const effectiveType = connection.effectiveType;
            
            
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
            
            testConnectionSpeed();
        }
    }

    
    function testConnectionSpeed() {
        const startTime = Date.now();
        const img = new Image();
        
        img.onload = function() {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            if (duration < 200) {
                
                isConnectionGood = true;
                minimumLoadTime = 800;
            } else if (duration < 500) {
                
                isConnectionGood = true;
                minimumLoadTime = 1200;
            } else {
                
                isConnectionGood = false;
                minimumLoadTime = 2500;
            }
            
            console.log(`Connection test: ${duration}ms, Minimum load time: ${minimumLoadTime}ms`);
            checkIfReadyToHide();
        };
        
        img.onerror = function() {
            
            isConnectionGood = false;
            minimumLoadTime = 3000;
            console.log('Connection test failed, using slow connection settings');
            checkIfReadyToHide();
        };
        
        
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7?' + Math.random();
    }

    
    function checkResourcesLoaded() {
        
        const images = document.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            return new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.addEventListener('load', resolve);
                    img.addEventListener('error', resolve); 
                }
            });
        });

        
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

        
        Promise.all([...imagePromises, ...stylesheetPromises]).then(() => {
            isContentLoaded = true;
            console.log('All resources loaded');
            checkIfReadyToHide();
        });
    }

    
    function checkIfReadyToHide() {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
        
        if (isContentLoaded && elapsedTime >= minimumLoadTime) {
            hideLoader();
        } else {
            
            setTimeout(() => {
                if (isContentLoaded || Date.now() - startTime >= minimumLoadTime * 2) {
                    hideLoader();
                }
            }, remainingTime);
        }
    }

    
    function hideLoader() {
        const loadingOverlay = document.getElementById('loading-overlay');
        const mainContent = document.getElementById('main-content');
        
        if (loadingOverlay) {
            
            loadingOverlay.style.transition = 'opacity 0.5s ease-out';
            loadingOverlay.style.opacity = '0';
            
            
            if (mainContent) {
                mainContent.style.transition = 'opacity 0.5s ease-out, visibility 0.5s ease-out';
                mainContent.style.opacity = '1';
                mainContent.style.visibility = 'visible';
            }
            
            
            document.body.style.overflow = '';
            
            
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
                console.log('Loading complete - content should now be visible');
            }, 500);
        }
    }

    
    if ('connection' in navigator) {
        navigator.connection.addEventListener('change', function() {
            console.log('Connection changed:', navigator.connection.effectiveType);
            if (!isContentLoaded) {
                checkConnection();
            }
        });
    }

    
    checkConnection();
    
    
    setTimeout(() => {
        checkResourcesLoaded();
    }, 100);

    
    const maxLoadTime = 10000; 
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            console.log('Force hiding loader after maximum time');
            hideLoader();
        }
    }, maxLoadTime);

  
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible' && !isContentLoaded) {
           
            checkConnection();
        }
    });
});


window.showLoader = function() {
    const existingOverlay = document.getElementById('loading-overlay');
    if (!existingOverlay) {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = '<div id="loader"></div>';
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        // Hide main content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.style.opacity = '0';
            mainContent.style.visibility = 'hidden';
        }
    }
};

window.hideLoader = function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const mainContent = document.getElementById('main-content');
    
    if (loadingOverlay) {
        loadingOverlay.style.transition = 'opacity 0.5s ease-out';
        loadingOverlay.style.opacity = '0';
        
        
        if (mainContent) {
            mainContent.style.transition = 'opacity 0.5s ease-out, visibility 0.5s ease-out';
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';
        }
        
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
            document.body.style.overflow = '';
        }, 500);
    }
};
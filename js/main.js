// JavaScript for BRAND waters site

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const coverSection = document.getElementById('cover');
    const scrollIndicator = document.getElementById('scrollDown');
    const mainContent = document.getElementById('main-content');
    const homepage = document.getElementById('homepage');
    const allSections = document.querySelectorAll('.fullpage-section');
    const body = document.body;
    
    // Variables to track scroll state
    let coverVisible = true;
    let lastScrollTop = 0;
    let isScrolling = false;
    let scrollTimeout;
    let coverLocked = false; // Lock to prevent unwanted cover reappearance
    let initialScrollComplete = false; // Flag to track if initial cover scroll is complete
    let scrollingEnabled = false; // Flag to control when scrolling is enabled
    let transitionInProgress = false; // Flag to prevent multiple transitions
    
    // Apply smooth transition class to all sections
    allSections.forEach(section => {
        section.classList.add('smooth-transition');
    });
    
    // Set initial states
    mainContent.style.display = 'block';
    mainContent.style.visibility = 'visible';
    
    // Prevent scrolling until cover is hidden
    function preventScroll(e) {
        if (transitionInProgress) {
            // Block all scroll events during transition to prevent stuttering
            e.preventDefault();
            return;
        }
        
        if (coverVisible) {
            // If cover is visible, prevent actual scrolling but trigger cover hide
            e.preventDefault();
            hideCoverShowHomepage();
        } else if (!scrollingEnabled) {
            // If cover is hidden but scrolling not enabled yet, reset to top
            e.preventDefault();
            window.scrollTo(0, 0);
        }
    }
    
    // Add wheel event listener for scroll prevention
    window.addEventListener('wheel', preventScroll, { passive: false });
    
    // Also prevent touch scrolling during transitions
    window.addEventListener('touchmove', function(e) {
        if (transitionInProgress || (coverVisible || !scrollingEnabled)) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Disable parallax effect during transitions
    const parallaxBackground = () => {
        document.addEventListener('mousemove', (e) => {
            if (!coverVisible && !transitionInProgress) { // Only apply when not transitioning
                const mouseX = e.clientX / window.innerWidth;
                const mouseY = e.clientY / window.innerHeight;
                
                // Calculate movement amount (small percentage of viewport)
                const moveX = mouseX * 15 - 7.5; // Reduced from 40 to 15
                const moveY = mouseY * 15 - 7.5; // Reduced from 40 to 15
                
                // Apply smooth transform to body background with requestAnimationFrame for better performance
                requestAnimationFrame(() => {
                    body.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
                });
            }
        });
    };
    
    // Initialize parallax effect
    parallaxBackground();
    
    // Ensure the welcome page is visible and properly positioned
    function ensureWelcomePageVisible() {
        // Reset scroll position to show the welcome heading at the top
        window.scrollTo({
            top: 0,
            behavior: 'auto' // Use auto to ensure immediate positioning
        });
    }
    
    // Smooth scroll function
    function smoothScroll(target, duration) {
        // Don't allow smooth scrolling during transitions
        if (transitionInProgress) return;
        
        const targetPosition = typeof target === 'number' ? target : target.getBoundingClientRect().top;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        // Easing function
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    }
    
    // Function to hide cover and show homepage
    function hideCoverShowHomepage() {
        if (coverVisible && !transitionInProgress) {
            // Set transition flag to prevent multiple transitions
            transitionInProgress = true;
            
            // Lock the cover to prevent it from reappearing
            coverLocked = true;
            
            // Ensure we're at the top before transitioning
            window.scrollTo(0, 0);
            
            // Disable scrolling during transition
            document.body.style.overflow = 'hidden';
            
            // Force hardware acceleration for smoother transitions
            coverSection.style.webkitBackfaceVisibility = 'hidden';
            coverSection.style.backfaceVisibility = 'hidden';
            mainContent.style.webkitBackfaceVisibility = 'hidden';
            mainContent.style.backfaceVisibility = 'hidden';
            
            // Add a small delay before starting transition to prevent stuttering
            setTimeout(() => {
                // Hide the cover
                coverSection.style.transform = 'translateY(-100%)';
                coverVisible = false;
                
                // After transition completes
                setTimeout(() => {
                    // Force scroll to top of homepage content
                    ensureWelcomePageVisible();
                    
                    // Mark initial scroll as complete
                    initialScrollComplete = true;
                    
                    // Re-enable overflow after a short delay to prevent immediate scrolling
                    setTimeout(() => {
                        document.body.style.overflow = 'auto';
                        scrollingEnabled = true;
                        transitionInProgress = false; // End of transition
                    }, 300);
                    
                    // Keep cover locked for a moment to prevent reappearance
                    setTimeout(() => {
                        coverLocked = false;
                    }, 1500);
                }, 700); // Match the CSS transition time
            }, 50);
        }
    }
    
    // Handle scrolling behavior
    window.addEventListener('scroll', function() {
        // Skip all scroll processing during transitions
        if (transitionInProgress) return;
        
        // Only process scroll events if scrolling is enabled or if we're showing the cover
        if (!scrollingEnabled && !coverVisible) {
            window.scrollTo(0, 0);
            return;
        }
        
        const scrollPosition = window.scrollY;
        
        // Clear timeout and set new one for scroll end detection
        window.clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            isScrolling = false;
        }, 100);
        
        // Set scrolling state
        if (!isScrolling) {
            isScrolling = true;
        }
        
        // Detect direction of scroll
        const scrollingDown = scrollPosition > lastScrollTop;
        lastScrollTop = scrollPosition;
        
        // If cover is visible and user scrolls down even slightly
        if (coverVisible && scrollingDown && scrollPosition > 5) {
            // Immediately hide the cover with smooth animation
            hideCoverShowHomepage();
        }
        
        // Only allow cover to reappear if explicitly scrolling up at the very top
        // AND the cover is not locked
        if (!coverVisible && !scrollingDown && scrollPosition === 0 && !coverLocked && !transitionInProgress) {
            // Set transition in progress
            transitionInProgress = true;
            
            // Disable scrolling
            document.body.style.overflow = 'hidden';
            
            // Show the cover
            coverSection.style.transform = 'translateY(0)';
            coverVisible = true;
            scrollingEnabled = false; // Disable scrolling again when cover reappears
            
            // After transition completes
            setTimeout(() => {
                transitionInProgress = false;
                document.body.style.overflow = 'auto';
            }, 700);
        }
    });
    
    // Add click event to scroll indicator
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            // Directly hide cover and show homepage
            hideCoverShowHomepage();
        });
    }
    
    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                smoothScroll(targetElement, 800);
            }
        });
    });
    
    // Ensure correct initial state
    ensureWelcomePageVisible();

    // Function to adjust the footer position
    function adjustFooter() {
        const footer = document.querySelector('.footer-tile');
        const body = document.body;
        const html = document.documentElement;
        
        if (footer) {
            // Get the document height
            const docHeight = Math.max(
                body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight
            );
            
            // Get the viewport height
            const viewportHeight = window.innerHeight;
            
            // Get the current scroll position
            const scrollPosition = window.scrollY || window.pageYOffset;
            
            // Calculate the footer's position
            const footerPosition = footer.offsetTop + footer.offsetHeight;
            
            // If the document is shorter than the viewport, adjust the footer
            if (docHeight < viewportHeight + scrollPosition) {
                document.querySelector('#homepage').style.paddingBottom = '0';
                document.querySelector('main').style.paddingBottom = '0';
            }
        }
    }
    
    // Run on load
    adjustFooter();
    
    // Run on resize
    window.addEventListener('resize', adjustFooter);
    
    // Run on scroll
    window.addEventListener('scroll', adjustFooter);
}); 
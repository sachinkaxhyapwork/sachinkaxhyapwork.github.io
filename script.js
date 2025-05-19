// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Use system dark mode preference only
    setupSystemTheme();

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
    }

    // Close menu when clicking on a link (for mobile)
    const menuLinks = document.querySelectorAll('.mobile-nav .menu a');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.left-panel') && 
            !event.target.closest('.mobile-nav') && 
            mobileNav.classList.contains('active')) {
            mobileNav.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === "#") return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 90, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });

    // Businesses & Brands Slider
    const brandsSliderContainer = document.querySelector('.brands-slider-container');
    const brandsSlider = document.querySelector('.brands-slider');
    const brandSlides = document.querySelectorAll('.brand-slide');
    const brandLinks = document.querySelectorAll('.brand-link');
    const brandPrevBtn = document.querySelector('.brand-prev');
    const brandNextBtn = document.querySelector('.brand-next');
    const brandDotsContainer = document.querySelector('.brand-dots');

    let currentBrand = 0;
    let slidesToShow = 5; // Default for desktop
    let totalSlides = brandSlides.length;
    let brandSliderInterval = null;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let isSliderActive = false; // Flag to track slider state

    // Function to update slider position
    function updateBrandSlider() {
        if (!isSliderActive) return; // Only run if slider is active

        const slideWidth = 100 / slidesToShow;
        // Ensure currentBrand doesn't exceed bounds
        if (currentBrand > totalSlides - slidesToShow) {
            currentBrand = totalSlides - slidesToShow;
        }
        if (currentBrand < 0) {
            currentBrand = 0;
        }
        brandsSlider.style.transform = `translateX(-${currentBrand * slideWidth}%)`;
        brandsSlider.style.transition = 'transform 0.5s ease'; // Ensure transition is applied

        // Update active dot
        const brandDots = document.querySelectorAll('.brand-dot');
        if (brandDots.length > 0) {
            const activePage = Math.floor(currentBrand / slidesToShow);
            brandDots.forEach((dot, index) => {
                 dot.classList.toggle('active', index === activePage);
            });
        }
    }

    // Function to go to a specific slide page
    function goToBrandPage(pageIndex) {
        if (!isSliderActive) return;
        const maxPages = Math.ceil(totalSlides / slidesToShow);
        if (pageIndex < 0) pageIndex = 0;
        if (pageIndex >= maxPages) pageIndex = maxPages - 1;
        currentBrand = pageIndex * slidesToShow;
        updateBrandSlider();
    }

    // Function to go to a specific slide index (adjusting for slidesToShow)
    function goToBrandSlide(index) {
        if (!isSliderActive) return;
         // Ensure index stays within valid range
        if (index < 0) {
            index = 0; // Go to the first slide if trying to go before the start
        } else if (index > totalSlides - slidesToShow) {
             // If trying to go past the last possible view, go to the start of the last page
            index = Math.max(0, totalSlides - slidesToShow);
        }
        currentBrand = index;
        updateBrandSlider();
    }

    // Function to prevent links from activating after a swipe/drag
    function preventLinksAfterSwipe() {
         // This might still be useful even in grid mode if accidental drags happen, but keep simple for now.
        // Consider if needed later.
    }

    // --- Event Handlers (to be attached/detached) ---
    function handleBrandPrevClick() { goToBrandSlide(currentBrand - slidesToShow); }
    function handleBrandNextClick() { goToBrandSlide(currentBrand + slidesToShow); }
    function handleDotClick(e) {
        if (e.target.classList.contains('brand-dot')) {
            goToBrandPage(parseInt(e.target.getAttribute('data-index')));
        }
    }
    function handleTouchStart(e) {
        if (!isSliderActive) return;
        touchStartX = e.changedTouches[0].screenX;
        isDragging = true;
        brandsSlider.style.transition = 'none'; // Disable transition during drag
    }
    function handleTouchMove(e) {
        if (!isSliderActive || !isDragging) return;
        touchEndX = e.changedTouches[0].screenX;
        currentTranslate = touchEndX - touchStartX;
        // Optional: Add visual feedback during move if desired (translateX)
        if (Math.abs(currentTranslate) > 10) {
            e.preventDefault(); // Prevent vertical scroll if swiping horizontally
        }
    }
    function handleTouchEnd(e) {
        if (!isSliderActive || !isDragging) return;
        isDragging = false;
        touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = touchEndX - touchStartX;
        const swipeThreshold = 50;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) { // Swipe right
                goToBrandSlide(currentBrand - slidesToShow);
            } else { // Swipe left
                goToBrandSlide(currentBrand + slidesToShow);
            }
        }
        // Re-enable transition after drag/swipe interaction ends
        brandsSlider.style.transition = 'transform 0.5s ease';
        touchStartX = 0; touchEndX = 0; currentTranslate = 0;
        resetAutoSlide(); // Reset interval after user interaction
    }
    function handleMouseDown(e) {
        if (!isSliderActive) return;
        isDragging = true;
        startPos = e.clientX;
        brandsSlider.style.transition = 'none'; // Disable transition during drag
        brandsSlider.style.cursor = 'grabbing';
    }
    function handleMouseMove(e) {
        if (!isSliderActive || !isDragging) return;
        const currentPos = e.clientX;
        currentTranslate = currentPos - startPos;
        // Optional: Add visual feedback during move if desired (translateX)
    }
    function handleMouseUp() {
        if (!isSliderActive || !isDragging) return;
        isDragging = false;
        brandsSlider.style.cursor = 'grab';
        if (Math.abs(currentTranslate) > 50) { // Threshold for drag slide change
            currentTranslate > 0 ? goToBrandSlide(currentBrand - slidesToShow) : goToBrandSlide(currentBrand + slidesToShow);
        }
         // Re-enable transition after drag interaction ends
        brandsSlider.style.transition = 'transform 0.5s ease';
        currentTranslate = 0;
        resetAutoSlide(); // Reset interval after user interaction
    }
    function handleMouseLeave() {
         if (!isSliderActive || !isDragging) return;
         // If mouse leaves while dragging, end the drag
         handleMouseUp();
    }
    function handleMouseEnter() { if (isSliderActive) clearInterval(brandSliderInterval); }
    function handleSliderTouchStart() { if (isSliderActive) clearInterval(brandSliderInterval); }
    function handleSliderMouseLeave() { if (isSliderActive) resetAutoSlide(); }
    function handleSliderTouchEnd() { if (isSliderActive) resetAutoSlide(); }

    // Function to start auto slide
    function startAutoSlide() {
        clearInterval(brandSliderInterval); // Clear existing interval first
        brandSliderInterval = setInterval(() => {
            if (!isSliderActive) {
                clearInterval(brandSliderInterval);
                return;
            }
             let nextSlide = currentBrand + slidesToShow;
             // If next slide goes beyond the total, loop back to the beginning
             if (nextSlide >= totalSlides) {
                 nextSlide = 0;
             }
             goToBrandSlide(nextSlide);
        }, 5000);
    }

    // Function to reset auto slide (e.g., after interaction)
    function resetAutoSlide() {
        if (!isSliderActive) return;
        clearInterval(brandSliderInterval);
        startAutoSlide();
    }

    // Function to initialize the slider
    function initializeBrandSlider() {
        if (isSliderActive || !brandsSlider || brandSlides.length <= slidesToShow) return; // Don't init if already active or not enough slides

        console.log("Initializing Brand Slider");
        isSliderActive = true;
        brandsSlider.style.transform = ''; // Clear any grid-related transform overrides
        brandsSlider.style.transition = 'transform 0.5s ease';
        brandsSlider.style.cursor = 'grab';
        brandSlides.forEach(slide => {
            const slideWidth = 100 / slidesToShow;
            slide.style.minWidth = `${slideWidth}%`;
            slide.style.flex = `0 0 ${slideWidth}%`;
        });

        // Create dots
        brandDotsContainer.innerHTML = ''; // Clear existing dots
        const maxPages = Math.ceil(totalSlides / slidesToShow);
        if (maxPages > 1) { // Only show dots if there's more than one page
            for (let i = 0; i < maxPages; i++) {
                const dot = document.createElement('span');
                dot.classList.add('brand-dot');
                dot.setAttribute('data-index', i);
                brandDotsContainer.appendChild(dot);
            }
            brandDotsContainer.addEventListener('click', handleDotClick);
            brandDotsContainer.style.display = 'flex'; // Ensure dots container is visible
        } else {
            brandDotsContainer.style.display = 'none'; // Hide if only one page
        }


        // Attach event listeners
        if (brandPrevBtn) brandPrevBtn.addEventListener('click', handleBrandPrevClick);
        if (brandNextBtn) brandNextBtn.addEventListener('click', handleBrandNextClick);
        brandsSlider.addEventListener('touchstart', handleTouchStart, { passive: true });
        brandsSlider.addEventListener('touchmove', handleTouchMove, { passive: false });
        brandsSlider.addEventListener('touchend', handleTouchEnd, { passive: true });
        brandsSlider.addEventListener('mousedown', handleMouseDown);
        brandsSlider.addEventListener('mousemove', handleMouseMove);
        brandsSlider.addEventListener('mouseup', handleMouseUp);
        brandsSlider.addEventListener('mouseleave', handleMouseLeave); // Added mouseleave to reset drag state

        // Auto slide and hover/touch pause
        brandsSlider.addEventListener('mouseenter', handleMouseEnter);
        brandsSlider.addEventListener('touchstart', handleSliderTouchStart, { passive: true });
        brandsSlider.addEventListener('mouseleave', handleSliderMouseLeave);
        brandsSlider.addEventListener('touchend', handleSliderTouchEnd, { passive: true });

        // Make controls visible
        if (brandPrevBtn) brandPrevBtn.style.display = 'flex';
        if (brandNextBtn) brandNextBtn.style.display = 'flex';


        // Initial setup
        currentBrand = 0; // Reset position
        updateBrandSlider();
        startAutoSlide();
    }

    // Function to destroy the slider
    function destroyBrandSlider() {
        if (!isSliderActive) return; // Don't destroy if not active

        console.log("Destroying Brand Slider");
        isSliderActive = false;
        clearInterval(brandSliderInterval);
        brandSliderInterval = null;

        // Remove event listeners
        if (brandPrevBtn) brandPrevBtn.removeEventListener('click', handleBrandPrevClick);
        if (brandNextBtn) brandNextBtn.removeEventListener('click', handleBrandNextClick);
        brandDotsContainer.removeEventListener('click', handleDotClick);
        brandsSlider.removeEventListener('touchstart', handleTouchStart);
        brandsSlider.removeEventListener('touchmove', handleTouchMove);
        brandsSlider.removeEventListener('touchend', handleTouchEnd);
        brandsSlider.removeEventListener('mousedown', handleMouseDown);
        brandsSlider.removeEventListener('mousemove', handleMouseMove);
        brandsSlider.removeEventListener('mouseup', handleMouseUp);
        brandsSlider.removeEventListener('mouseleave', handleMouseLeave);
        brandsSlider.removeEventListener('mouseenter', handleMouseEnter);
        brandsSlider.removeEventListener('touchstart', handleSliderTouchStart);
        brandsSlider.removeEventListener('mouseleave', handleSliderMouseLeave);
        brandsSlider.removeEventListener('touchend', handleSliderTouchEnd);

        // Reset styles potentially affected by JS slider logic
        brandsSlider.style.transform = ''; // Let CSS handle grid layout
        brandsSlider.style.transition = '';
        brandsSlider.style.cursor = 'default';
        brandSlides.forEach(slide => {
            slide.style.minWidth = '';
            slide.style.flex = '';
        });

        // Clear dots and hide controls (CSS also hides them, but this is cleaner)
        brandDotsContainer.innerHTML = '';
        brandDotsContainer.style.display = 'none';
        if (brandPrevBtn) brandPrevBtn.style.display = 'none';
        if (brandNextBtn) brandNextBtn.style.display = 'none';

    }

    // Function to check mode and init/destroy slider
    function checkSliderMode() {
        const mobileBreakpoint = 768; // Or your desired breakpoint
        const isMobile = window.innerWidth <= mobileBreakpoint;

        // Update slidesToShow based on current width IF slider is potentially active
        if (window.innerWidth <= 992 && window.innerWidth > mobileBreakpoint) {
            slidesToShow = 3;
        } else if (window.innerWidth <= 1200 && window.innerWidth > mobileBreakpoint) {
             slidesToShow = 4;
        } else if (window.innerWidth > 1200) {
             slidesToShow = 5;
        }
        // Note: slidesToShow is not used when isMobile is true

        if (isMobile) {
            destroyBrandSlider();
        } else {
            // Check if we have enough slides to warrant a slider
            if (brandSlides.length > slidesToShow) {
                 initializeBrandSlider();
                 // Need to update slider in case slidesToShow changed
                 updateBrandSlider();
                 resetAutoSlide(); // Restart interval possibly with new slidesToShow
            } else {
                 // Not enough slides for a slider even on desktop, ensure it's destroyed
                 destroyBrandSlider();
            }
        }
    }

    // Initial Check & Setup
    if (brandsSlider && brandSlides.length > 0) {
        // Set initial cursor style
        brandsSlider.style.cursor = 'grab';

        // Initial check
        checkSliderMode();

        // Add resize listener
        window.addEventListener('resize', checkSliderMode);
    }

    // Testimonial Slider
    const testimonialSlider = document.querySelector('.testimonial-slider');
    const testimonials = document.querySelectorAll('.testimonial-item');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const dotsContainer = document.querySelector('.dots');
    
    if (testimonialSlider && testimonials.length > 0) {
        let current = 0;
        const slideWidth = 100; // 100%
        
        // Create dots for slider
        testimonials.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('data-index', index);
            dotsContainer.appendChild(dot);
            
            dot.addEventListener('click', function() {
                goToSlide(parseInt(this.getAttribute('data-index')));
            });
        });
        
        const dots = document.querySelectorAll('.dot');
        
        // Function to update slider position
        function updateSlider() {
            testimonialSlider.style.transform = `translateX(-${current * slideWidth}%)`;
            
            // Update active dot
            dots.forEach((dot, index) => {
                if (index === current) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Function to go to a specific slide
        function goToSlide(index) {
            current = index;
            updateSlider();
        }
        
        // Event listeners for prev/next buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                current = (current === 0) ? testimonials.length - 1 : current - 1;
                updateSlider();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                current = (current === testimonials.length - 1) ? 0 : current + 1;
                updateSlider();
            });
        }
        
        // Auto slide change
        setInterval(() => {
            current = (current === testimonials.length - 1) ? 0 : current + 1;
            updateSlider();
        }, 5000);
    }
    
    // Form submission handling
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Simulate form submission
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                
                // Simulate API call with timeout
                setTimeout(() => {
                    // Reset form
                    this.reset();
                    
                    // Show success message
                    alert('Thank you for your submission! We will get back to you soon.');
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }, 1500);
            }
        });
    });
    
    // Scroll to top button
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.classList.add('scroll-top');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollTopBtn);
    
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Show/hide scroll to top button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('active');
        } else {
            scrollTopBtn.classList.remove('active');
        }
    });
    
    // Add active class to header on scroll
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Add CSS for scroll to top button, theme toggle, and header scrolled state
    const style = document.createElement('style');
    style.textContent = `
        .scroll-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .scroll-top.active {
            opacity: 1;
            visibility: visible;
        }
        
        .scroll-top:hover {
            background: var(--primary-dark);
            transform: translateY(-3px);
        }
        
        header.scrolled {
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            background-color: var(--bg-color);
        }
        
        .form-group input.error, 
        .form-group textarea.error {
            border-color: #e74c3c;
        }

        .dark-mode {
            --text-color: #f5f5f5;
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --secondary-bg: #2d2d2d;
            --border: #444;
            --footer-bg: #000;
            --footer-text: #aaa;
        }

        .light-mode {
            --text-color: #333;
            --bg-color: #fff;
            --card-bg: #fff;
            --secondary-bg: #f8f9fa;
            --border: #e1e1e1;
            --footer-bg: #1a1a1a;
            --footer-text: #ccc;
        }
    `;
    document.head.appendChild(style);
});

// Dark mode toggle functionality
function setupSystemTheme() {
    // Use system dark mode preference only
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (prefersDark) {
        document.documentElement.classList.add('dark-mode');
        document.documentElement.classList.remove('light-mode');
    } else {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark-mode');
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (e.matches) {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
        } else {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark-mode');
        }
    });
}

// Add animation when elements come into view
function animateOnScroll() {
    const elements = document.querySelectorAll('.about-content, .vision-content, .why-choose, .choose-item, .stat-box, .gallery-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Call the animate function
window.addEventListener('load', animateOnScroll);

// Add animation CSS
document.addEventListener('DOMContentLoaded', function() {
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        .about-content, .vision-content, .why-choose, .stat-box {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .choose-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
            transition-delay: calc(var(--i, 0) * 0.1s);
        }
        
        .gallery-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
            transition-delay: calc(var(--j, 0) * 0.15s);
        }
        
        .about-content.animate, .vision-content.animate, .why-choose.animate, .stat-box.animate, .choose-item.animate, .gallery-item.animate {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(animationStyle);
    
    // Set delay for each choose item
    const chooseItems = document.querySelectorAll('.choose-item');
    chooseItems.forEach((item, index) => {
        item.style.setProperty('--i', index);
    });
    
    // Set delay for each gallery item
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.style.setProperty('--j', index);
    });
}); 
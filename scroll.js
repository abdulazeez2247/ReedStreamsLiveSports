document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.querySelectorAll('.indicator');
    
    let currentIndex = 0;
    const totalItems = document.querySelectorAll('.carousel-item').length;
    let autoScrollInterval;
    let isTransitioning = false;
    
    // Function to update carousel position
    function updateCarousel() {
        if (isTransitioning) return;
        
        isTransitioning = true;
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
        
        // Reset transitioning flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }
    
    // Next slide function
    function nextSlide() {
        if (isTransitioning) return;
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }
    
    // Previous slide function
    function prevSlide() {
        if (isTransitioning) return;
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    }
    
    // Set up auto-scroll
    function startAutoScroll() {
        autoScrollInterval = setInterval(nextSlide, 5000);
    }
    
    // Stop auto-scroll on user interaction
    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }
    
    // Event listeners
    nextBtn.addEventListener('click', function() {
        stopAutoScroll();
        nextSlide();
        startAutoScroll();
    });
    
    prevBtn.addEventListener('click', function() {
        stopAutoScroll();
        prevSlide();
        startAutoScroll();
    });
    
    // Indicator clicks
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            if (isTransitioning) return;
            stopAutoScroll();
            currentIndex = parseInt(this.getAttribute('data-index'));
            updateCarousel();
            startAutoScroll();
        });
    });
    
    // Pause auto-scroll on hover
    carousel.addEventListener('mouseenter', stopAutoScroll);
    carousel.addEventListener('mouseleave', startAutoScroll);
    
    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    
    carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    
    carousel.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                stopAutoScroll();
                nextSlide();
                startAutoScroll();
            } else {
                // Swipe right - previous slide
                stopAutoScroll();
                prevSlide();
                startAutoScroll();
            }
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            stopAutoScroll();
            prevSlide();
            startAutoScroll();
        } else if (e.key === 'ArrowRight') {
            stopAutoScroll();
            nextSlide();
            startAutoScroll();
        }
    });
    
    // Initialize
    updateCarousel();
    startAutoScroll();
}); 
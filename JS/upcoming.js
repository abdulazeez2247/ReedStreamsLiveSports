// Updated JavaScript - Unified scrolling for all devices

// Remove mobile drag scrolling functionality completely
function setupMobileScrolling() {
    // This function is now empty since we're using unified scrolling
    // The mobile rows will use the same scroll animations as desktop
}

// Scroll-triggered animations for ALL DEVICES with INFINITE LOOPING
function setupScrollAnimations() {
    // Get both mobile and desktop rows
    const mobileRows = [
        document.getElementById('mobile-scrolling-row-1'),
        document.getElementById('mobile-scrolling-row-2')
    ];
    
    const desktopRows = [
        document.getElementById('desktop-scrolling-row-1'),
        document.getElementById('desktop-scrolling-row-2')
    ];
    
    // Combine all rows that should have scroll animations
    const allRows = [...mobileRows, ...desktopRows].filter(row => row !== null);
    
    let scrollPosition = 0;
    let lastScrollPosition = 0;
    let animationId = null;
    let isUserScrolling = false;
    let userScrollTimeout = null;
    
    // Calculate content width for each row
    function getContentWidth(row) {
        if (!row.children.length) return 0;
        const cardWidth = 340; // match your CSS card width
        const gap = 28; // 1.8rem gap
        const cardsPerSet = 10; // We have 10 unique cards
        return (cardWidth + gap) * cardsPerSet;
    }
    
    // Set initial positions for all rows
    allRows.forEach(row => {
        const initialOffset = (340 + 28) * 5; // 5 cards offset to start from center
        row.style.transform = `translateX(-${initialOffset}px)`;
        row.style.transition = 'transform 0.1s ease-out'; // Smooth transition
    });
    
    // Enable manual scrolling
    allRows.forEach(row => {
        row.addEventListener('wheel', handleManualScroll, { passive: false });
        row.addEventListener('touchstart', handleTouchStart, { passive: true });
        row.addEventListener('touchmove', handleTouchMove, { passive: false });
    });
    
    let touchStartX = 0;
    let currentManualScroll = 0;
    
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        currentManualScroll = parseFloat(e.currentTarget.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    }
    
    function handleTouchMove(e) {
        if (!isUserScrolling) {
            isUserScrolling = true;
            resetUserScrollState();
        }
        
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        
        const row = e.currentTarget;
        const rowWidth = getContentWidth(row);
        
        let newTransform = currentManualScroll + deltaX;
        
        // INFINITE LOOP - reset when it reaches the content width
        if (newTransform >= 0) {
            newTransform = -rowWidth;
        } else if (newTransform <= -rowWidth) {
            newTransform = 0;
        }
        
        row.style.transform = `translateX(${newTransform}px)`;
        e.preventDefault();
    }
    
    function handleManualScroll(e) {
        if (!isUserScrolling) {
            isUserScrolling = true;
            resetUserScrollState();
        }
        
        const row = e.currentTarget;
        const rowWidth = getContentWidth(row);
        const deltaX = e.deltaY; // Use vertical scroll for horizontal movement
        
        let currentTransform = parseFloat(row.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
        let newTransform = currentTransform + deltaX;
        
        // INFINITE LOOP - reset when it reaches the content width
        if (newTransform >= 0) {
            newTransform = -rowWidth;
        } else if (newTransform <= -rowWidth) {
            newTransform = 0;
        }
        
        row.style.transform = `translateX(${newTransform}px)`;
        e.preventDefault();
    }
    
    function resetUserScrollState() {
        // Clear any existing timeout
        if (userScrollTimeout) {
            clearTimeout(userScrollTimeout);
        }
        
        // Set timeout to resume automatic scrolling after user stops
        userScrollTimeout = setTimeout(() => {
            isUserScrolling = false;
        }, 1500); // Resume after 1.5 seconds of inactivity
    }
    
    function handleScroll() {
        // Don't animate if user is manually scrolling the cards
        if (isUserScrolling) {
            lastScrollPosition = window.scrollY;
            return;
        }
        
        scrollPosition = window.scrollY;
        const scrollDelta = scrollPosition - lastScrollPosition;
        
        // Only animate if user is actively scrolling
        if (Math.abs(scrollDelta) > 0) {
            // Cancel any existing animation frame
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            
            // Apply scroll-based movement with INFINITE LOOP
            animationId = requestAnimationFrame(() => {
                // Apply different speeds for visual interest
                allRows.forEach((row, index) => {
                    const speed = index % 2 === 0 ? 0.8 : 0.6; // Alternate speeds
                    const rowWidth = getContentWidth(row);
                    
                    let currentTransform = parseFloat(row.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
                    
                    // Apply movement based on scroll direction
                    if (index % 2 === 0) {
                        // Even rows move RIGHT on scroll down, LEFT on scroll up
                        currentTransform = currentTransform + (scrollDelta * speed);
                    } else {
                        // Odd rows move LEFT on scroll down, RIGHT on scroll up  
                        currentTransform = currentTransform - (scrollDelta * speed);
                    }
                    
                    // INFINITE LOOP - reset when it reaches the content width
                    if (currentTransform >= 0) {
                        currentTransform = -rowWidth;
                    } else if (currentTransform <= -rowWidth) {
                        currentTransform = 0;
                    }
                    
                    row.style.transform = `translateX(${currentTransform}px)`;
                });
            });
        }
        
        lastScrollPosition = scrollPosition;
    }
    
    // Optimized scroll handling for better performance
    let ticking = false;
    let lastTime = 0;
    const fps = 60;
    const interval = 1000 / fps;
    
    function throttledScroll() {
        const now = Date.now();
        const elapsed = now - lastTime;
        
        if (!ticking && elapsed > interval) {
            lastTime = now - (elapsed % interval);
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Use passive scroll listener for better performance
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Reset positions on resize
    window.addEventListener('resize', () => {
        const newInitialOffset = (340 + 28) * 5;
        allRows.forEach(row => {
            row.style.transform = `translateX(-${newInitialOffset}px)`;
        });
    });
}

// Function to get tomorrow's date in the required format
function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[tomorrow.getDay()];
    const month = months[tomorrow.getMonth()];
    const date = tomorrow.getDate();
    
    return {
        fullDate: `${dayName}, ${month} ${date}`,
        shortDate: `${month} ${date}`
    };
}

// Rest of your existing functions remain the same
function generateMatches(type) {
    const mobileScrollingRow1 = document.getElementById('mobile-scrolling-row-1');
    const mobileScrollingRow2 = document.getElementById('mobile-scrolling-row-2');
    const desktopScrollingRow1 = document.getElementById('desktop-scrolling-row-1');
    const desktopScrollingRow2 = document.getElementById('desktop-scrolling-row-2');
    
    // Clear existing content
    mobileScrollingRow1.innerHTML = '';
    mobileScrollingRow2.innerHTML = '';
    desktopScrollingRow1.innerHTML = '';
    desktopScrollingRow2.innerHTML = '';
    
    // Get tomorrow's date
    const tomorrow = getTomorrowDate();
    
    // Base match data - 10 unique matches for each row with TOMORROW'S DATE
    const row1BaseMatches = [
        { team1: 'SBA', team2: 'BOY', date: `${tomorrow.fullDate}`, time: '17:00hs', logo1: 'https://assets.nunchee.com/out/663e77558f3b977371bc211f/original/square/25.png', logo2: 'https://assets.nunchee.com/out/67b3863a88ce21802deacd8c/original/square/25.webp' },
        { team1: 'ALI', team2: 'SCL', date: `${tomorrow.shortDate}`, time: '18:00hs', logo1: 'https://assets.nunchee.com/out/65e0dcfbd7158f00248870b1/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dcfda34797002386bccf/original/square/25.png' },
        { team1: 'UNI', team2: 'BIN', date: `${tomorrow.fullDate}`, time: '16:00hs', logo1: 'https://assets.nunchee.com/out/65e0dcf7ffdfd4001d4acc09/original/square/25.png', logo2: 'https://assets.nunchee.com/out/663e77918f3b977371bc221d/original/square/25.png' },
        { team1: 'UTC', team2: 'CUS', date: `${tomorrow.fullDate}`, time: '16:00hs', logo1: 'https://assets.nunchee.com/out/65d9e412878f81001c9d878d/original/square/25.png', logo2: 'https://assets.nunchee.com/out/663e7763c2e2b7b5bb8349d8/original/square/25.png' },
        { team1: 'CAG', team2: 'SCL', date: `${tomorrow.fullDate}`, time: '09:00hs', logo1: 'https://assets.nunchee.com/out/65e0dd08ffdfd4001d4acc28/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dcf9ffdfd4001d4acc0d/original/square/25.png' },
        { team1: 'LCH', team2: 'UTC', date: `${tomorrow.fullDate}`, time: '11:15hs', logo1: 'https://assets.nunchee.com/out/65e0dd01d7158f00248870b9/original/square/25.png', logo2: 'https://assets.nunchee.com/out/6894e05afe52bdaf931ec436/original/square/25.webp' },
        { team1: 'MUN', team2: 'CHE', date: `${tomorrow.fullDate}`, time: '15:00hs', logo1: 'https://assets.nunchee.com/out/65e0dcfbd7158f00248870b1/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dcfda34797002386bccf/original/square/25.png' },
        { team1: 'ARS', team2: 'LIV', date: `${tomorrow.fullDate}`, time: '17:30hs', logo1: 'https://assets.nunchee.com/out/65e0dcf7ffdfd4001d4acc09/original/square/25.png', logo2: 'https://assets.nunchee.com/out/663e77918f3b977371bc221d/original/square/25.png' },
        { team1: 'BAR', team2: 'MAD', date: `${tomorrow.fullDate}`, time: '20:00hs', logo1: 'https://assets.nunchee.com/out/65d9e412878f81001c9d878d/original/square/25.png', logo2: 'https://assets.nunchee.com/out/663e7763c2e2b7b5bb8349d8/original/square/25.png' },
        { team1: 'PSG', team2: 'BAY', date: `${tomorrow.fullDate}`, time: '21:00hs', logo1: 'https://assets.nunchee.com/out/65e0dd08ffdfd4001d4acc28/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dcf9ffdfd4001d4acc0d/original/square/25.png' }
    ];
    
    const row2BaseMatches = [
        { team1: 'AUN', team2: 'ADT', date: `${tomorrow.fullDate}`, time: '13:30hs', logo1: 'https://assets.nunchee.com/out/663e777f52a56c84b6901908/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dcf5878f81001c9e8c7e/original/square/25.png' },
        { team1: 'ADT', team2: 'UNI', date: `${tomorrow.fullDate}`, time: '13:30hs', logo1: 'https://assets.nunchee.com/out/63d978be8df6657354bf1530/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dceed7158f00248870a5/original/square/25.png' },
        { team1: 'INT', team2: 'JUV', date: `${tomorrow.fullDate}`, time: '14:00hs', logo1: 'https://assets.nunchee.com/out/65e0dcfbd7158f00248870b1/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dcfda34797002386bccf/original/square/25.png' },
        { team1: 'ATM', team2: 'RMA', date: `${tomorrow.fullDate}`, time: '16:30hs', logo1: 'https://assets.nunchee.com/out/65e0dcf7ffdfd4001d4acc09/original/square/25.png', logo2: 'https://assets.nunchee.com/out/663e77918f3b977371bc221d/original/square/25.png' },
        { team1: 'NAP', team2: 'ROM', date: `${tomorrow.fullDate}`, time: '19:00hs', logo1: 'https://assets.nunchee.com/out/65d9e412878f81001c9d878d/original/square/25.png', logo2: 'https://assets.nunchee.com/out/663e7763c2e2b7b5bb8349d8/original/square/25.png' },
        { team1: 'DOR', team2: 'LEV', date: `${tomorrow.fullDate}`, time: '21:30hs', logo1: 'https://assets.nunchee.com/out/65e0dd08ffdfd4001d4acc28/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dcf9ffdfd4001d4acc0d/original/square/25.png' },
        { team1: 'MAR', team2: 'LYO', date: `${tomorrow.fullDate}`, time: '18:00hs', logo1: 'https://assets.nunchee.com/out/663e777f52a56c84b6901908/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dcf5878f81001c9e8c7e/original/square/25.png' },
        { team1: 'MON', team2: 'LIL', date: `${tomorrow.fullDate}`, time: '20:00hs', logo1: 'https://assets.nunchee.com/out/63d978be8df6657354bf1530/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dceed7158f00248870a5/original/square/25.png' },
        { team1: 'CEL', team2: 'RAN', date: `${tomorrow.fullDate}`, time: '19:45hs', logo1: 'https://assets.nunchee.com/out/65e0dcfbd7158f00248870b1/original/square/25.png', logo2: 'https://assets.nunchee.com/out/65e0dcfda34797002386bccf/original/square/25.png' },
        { team1: 'BEN', team2: 'POR', date: `${tomorrow.fullDate}`, time: '21:00hs', logo1: 'https://assets.nunchee.com/out/65e0dcf7ffdfd4001d4acc09/original/square/25.png', logo2: 'https://assets.nunchee.com/out/663e77918f3b977371bc221d/original/square/25.png' }
    ];
    
    // Generate match cards for mobile scrolling
    row1BaseMatches.forEach(match => {
        const matchCard = createMatchCard(match, type);
        mobileScrollingRow1.appendChild(matchCard.cloneNode(true));
    });
    
    row2BaseMatches.forEach(match => {
        const matchCard = createMatchCard(match, type);
        mobileScrollingRow2.appendChild(matchCard.cloneNode(true));
    });
    
    // Generate INFINITE match cards for desktop - DUPLICATE CONTENT
    // Each row gets the same 10 matches duplicated to create seamless loop
    for (let i = 0; i < 3; i++) {
        row1BaseMatches.forEach(match => {
            const matchCard1 = createMatchCard(match, type);
            desktopScrollingRow1.appendChild(matchCard1);
        });
        
        row2BaseMatches.forEach(match => {
            const matchCard2 = createMatchCard(match, type);
            desktopScrollingRow2.appendChild(matchCard2);
        });
    }
    
    // Setup scrolling after cards are generated
    setupMobileScrolling(); // This is now empty but kept for compatibility
    setupScrollAnimations(); // This now handles ALL devices
}

// Create individual match card (unchanged)
function createMatchCard(match, type) {
    const card = document.createElement('div');
    card.className = 'match-card';
    
    card.innerHTML = `
        <div class="match-header">
            <span class="${type === 'live' ? 'live-badge' : 'upcoming-badge'}">${type === 'live' ? 'LIVE' : 'UPCOMING'}</span>
        </div>
        <div class="teams-container">
            <div class="team">
                <div class="team-logo"><img src="${match.logo1}" alt="${match.team1} logo" style="width: 100px; height: 80px;"></div>
                <span class="team-name">${match.team1}</span>
            </div>
            <div class="match-info">
                <div class="match-time">${match.time}</div>
                <div class="match-date">${match.date}</div>
            </div>
            <div class="team">
                <div class="team-logo"><img src="${match.logo2}" alt="${match.team2} logo" style="width: 100px; height: 80px;"></div>
                <span class="team-name">${match.team2}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Initialize with upcoming matches
document.addEventListener('DOMContentLoaded', function() {
    generateMatches('upcoming');
});
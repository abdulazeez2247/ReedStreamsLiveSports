// Streamed.pk API Base URL
const STREAMED_API_BASE = "https://streamed.pk/api";

function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

// Global variable to store the current sport name.
// This is set immediately when the script loads to ensure it's available 
// before any DOM events (like the filter's DOMContentLoaded) fire.
let currentSportName = (getQueryParam("sportName") || "Sport").trim();

function formatMatchTime(dateString) {
  try {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return "N/A";
  }
}

// Function to get team badge image URL
function getTeamBadgeUrl(badgeId) {
  if (!badgeId) return null;
  return `${STREAMED_API_BASE}/images/badge/${badgeId}.webp`;
}

// Function to create team badge HTML
function createTeamBadgeHTML(team, side) {
  if (!team) return `<div class="team-placeholder ${side}">?</div>`;
  
  const badgeUrl = getTeamBadgeUrl(team.badge);
  
  return `
    <div class="team-info ${side}">
      ${badgeUrl ? `<img src="${badgeUrl}" alt="${team.name || 'Team'}" class="team-badge" onerror="this.style.display='none'">` : ''}
      <span class="team-name">${team.name || 'Unknown'}</span>
    </div>
  `;
}

async function loadLiveMatches() {
  const sportId = getQueryParam("sportId");
  const sportName = currentSportName || "Sport"; // Use the global variable
  const matchContainer = document.querySelector("#match-list");
  
  matchContainer.innerHTML = '<div class="loading-message">Loading matches...</div>';

  if (!sportId) {
    matchContainer.innerHTML = `<p class="error-message">No sport selected. Please go back and choose a sport.</p>`;
    return;
  }

  try {
    const res = await fetch(`${STREAMED_API_BASE}/matches/${sportId}`);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const matches = await res.json();

    // Update page title
    const pageTitle = document.querySelector("#page-title");
    if (pageTitle) {
      pageTitle.textContent = `${sportName.charAt(0).toUpperCase() + sportName.slice(1)} - Live Matches`;
    }

    if (!Array.isArray(matches) || matches.length === 0) {
      matchContainer.innerHTML = `<p class="no-matches">No live matches currently available for ${sportName}.</p>`;
      return;
    }

    const matchesGrid = document.createElement("div");
    matchesGrid.className = "matches-grid";
    matchContainer.innerHTML = "";
    matchContainer.appendChild(matchesGrid);

    matches.forEach((match) => {
      const startTime = formatMatchTime(match.date);
      const homeTeam = match.teams?.home;
      const awayTeam = match.teams?.away;

      const matchCard = document.createElement("div");
      matchCard.className = "match-card";
      matchCard.innerHTML = `
        <div class="match-header">
          <h4>${match.title || "Match"}</h4>
          <span class="live-status">LIVE</span>
        </div>
        <div class="teams-container">
          ${createTeamBadgeHTML(homeTeam, 'home')}
          <span class="vs-separator">VS</span>
          ${createTeamBadgeHTML(awayTeam, 'away')}
        </div>
        <p class="start-time">${startTime}</p>
        <button class="watch-link" data-match-id="${match.id}" data-match-data='${JSON.stringify(match)}'>
          <i class="fas fa-play-circle"></i> Watch Now
        </button>
      `;
      matchesGrid.appendChild(matchCard);
    });

    // Add click handler for watch buttons
    matchesGrid.addEventListener("click", async (e) => {
      const btn = e.target.closest(".watch-link");
      if (!btn) return;

      const matchData = JSON.parse(btn.getAttribute("data-match-data"));
      
      // Store match data in sessionStorage for the match page
      sessionStorage.setItem('currentMatch', JSON.stringify(matchData));
      
      // Navigate to match page with match ID
      window.location.href = `match.html?matchId=${matchData.id}`;
    });

  } catch (err) {
    console.error("Error fetching matches:", err);
    matchContainer.innerHTML = '<p class="error-message">Failed to load matches. Please try again later.</p>';
  }
}

loadLiveMatches();




function setupSearch() {
    const searchInputs = document.querySelectorAll('.search-container input, .mobile-search input');
    const categoryCards = document.querySelectorAll('.category-card');
    const channelCards = document.querySelectorAll('.channel-card');
    const matchList = document.querySelector('#match-list');

    // Create search results title if it doesn't exist
    let resultsTitle = document.getElementById('search-results-title');
    if (!resultsTitle) {
        resultsTitle = document.createElement('h2');
        resultsTitle.id = 'search-results-title';
        resultsTitle.style.display = 'none';
        document.querySelector('.sports-categories').parentNode.insertBefore(resultsTitle, document.querySelector('.sports-categories'));
    }

    // Add clear buttons to search inputs
    searchInputs.forEach(input => {
        const container = input.closest('.search-container, .mobile-search');
        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.className = 'clear-search';
        clearBtn.style.display = 'none';
        container.appendChild(clearBtn);

        input.addEventListener('input', (e) => {
            clearBtn.style.display = e.target.value ? 'block' : 'none';
            filterContent(e.target.value, categoryCards, channelCards, matchList, resultsTitle);
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            filterContent('', categoryCards, channelCards, matchList, resultsTitle);
            input.focus();
        });
    });
}

function filterContent(query, categoryCards, channelCards, matchList, resultsTitle) {
    const normalizedQuery = query.toLowerCase().trim();
    let resultCount = 0;

    // Reset all cards and remove highlights
    categoryCards.forEach(card => {
        card.style.display = 'block';
        const nameEl = card.querySelector('.category-name');
        nameEl.innerHTML = nameEl.textContent;
    });

    channelCards.forEach(card => {
        card.style.display = 'block';
        const nameEl = card.querySelector('.channel-name');
        nameEl.innerHTML = nameEl.textContent;
    });

    // Reset match list cards
    const matchCards = matchList.querySelectorAll(':scope > *'); // Direct children of #match-list
    matchCards.forEach(card => {
        card.style.display = 'block';
        const textElements = card.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span'); // Common text elements
        textElements.forEach(el => {
            el.innerHTML = el.textContent;
        });
    });

    if (normalizedQuery.length === 0) {
        resultsTitle.style.display = 'none';
        return;
    }

    // Filter and highlight category cards
    categoryCards.forEach(card => {
        const nameEl = card.querySelector('.category-name');
        const name = nameEl.textContent.toLowerCase();
        if (name.includes(normalizedQuery)) {
            resultCount++;
            highlightText(nameEl, normalizedQuery);
        } else {
            card.style.display = 'none';
        }
    });

    // Filter and highlight channel cards
    channelCards.forEach(card => {
        const nameEl = card.querySelector('.channel-name');
        const name = nameEl.textContent.toLowerCase();
        if (name.includes(normalizedQuery)) {
            resultCount++;
            highlightText(nameEl,

normalizedQuery);
        } else {
            card.style.display = 'none';
        }
    });

    // Filter and highlight match cards in #match-list
    matchCards.forEach(card => {
        let hasMatch = false;
        const textElements = card.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span'); // Common text elements
        textElements.forEach(el => {
            const text = el.textContent.toLowerCase();
            if (text.includes(normalizedQuery)) {
                hasMatch = true;
                highlightText(el, normalizedQuery);
            }
        });
        if (hasMatch) {
            resultCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Update results title
    if (resultCount > 0) {
        resultsTitle.style.display = 'block';
        resultsTitle.innerHTML = `Found ${resultCount} results for "${query}"`;
        resultsTitle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        resultsTitle.style.display = 'block';
        resultsTitle.innerHTML = `No results found for "${query}"`;
    }
}

function highlightText(element, searchText) {
    const text = element.textContent;
    const regex = new RegExp(searchText, 'gi');
    element.innerHTML = text.replace(regex, match => `<span class="highlight-match">${match}</span>`);
}

/**
 * Helper function to check if the current sport is NFL/American Football.
 * We check for both 'nfl' and 'american football' for maximum compatibility.
 */
function isNflOrAmericanFootball() {
    const lowerCaseName = currentSportName.toLowerCase();
    // Check if name is 'american football' OR includes 'nfl' 
    return lowerCaseName === 'american football' || lowerCaseName.includes('nfl');
}


// AGGRESSIVE MATCH FILTER - GUARANTEED TO WORK
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aggressive filter loaded - waiting for matches...');
    
    // Wait longer for matches to load and use multiple attempts
    let attempts = 0;
    const maxAttempts = 5;
    
    const checkMatches = setInterval(() => {
        attempts++;
        const matchCards = document.querySelectorAll('.match-card');
        
        // Skip interval logic entirely if NFL/American Football is detected.
        if (isNflOrAmericanFootball()) {
             console.log('American Football sport detected. Stopping aggressive filter checks.');
             clearInterval(checkMatches);
             // Ensure all matches are visible (should already be the case by default)
             matchCards.forEach(card => card.style.display = 'block');
             addFilterToggle(); // Add toggle but it will be disabled/show info inside the function
             return;
        }

        if (matchCards.length > 0 || attempts >= maxAttempts) {
            clearInterval(checkMatches);
            console.log(`Found ${matchCards.length} match cards, applying filter...`);
            applyAggressiveFilter();
            addFilterToggle();
        }
    }, 1000);
});

function applyAggressiveFilter() {
    // ----------------------------------------------------
    // NFL/American Football Check: Disable filter if sport is American Football
    // ----------------------------------------------------
    if (isNflOrAmericanFootball()) {
        console.log('American Football sport detected. Aggressive filter is DISABLED.');
        const matchCards = document.querySelectorAll('.match-card');
        matchCards.forEach(card => {
            card.style.display = 'block'; // Ensure all cards are visible
        });
        return 0; 
    }
    // ----------------------------------------------------

    const matchCards = document.querySelectorAll('.match-card');
    const now = new Date();
    let hiddenCount = 0;
    
    console.log('Applying aggressive 15-minute filter...');
    
    matchCards.forEach((card, index) => {
        const startTimeElement = card.querySelector('.start-time');
        const liveStatusElement = card.querySelector('.live-status');
        
        // Always show LIVE matches
        if (liveStatusElement && liveStatusElement.textContent.includes('LIVE')) {
            console.log(`Card ${index}: LIVE match - SHOWING`);
            card.style.display = 'block';
            card.dataset.matchStatus = 'live';
            return;
        }
        
        if (!startTimeElement) {
            console.log(`Card ${index}: No time element - SHOWING`);
            card.style.display = 'block';
            card.dataset.matchStatus = 'unknown';
            return;
        }
        
        const timeText = startTimeElement.textContent.trim();
        console.log(`Card ${index}: Time text: "${timeText}"`);
        
        const matchTime = parseTimeText(timeText);
        
        if (!matchTime) {
            console.log(`Card ${index}: Could not parse time - SHOWING`);
            card.style.display = 'block';
            card.dataset.matchStatus = 'unknown';
            return;
        }
        
        const timeDiff = (matchTime - now) / (1000 * 60); // Difference in minutes
        
        console.log(`Card ${index}: Time difference: ${timeDiff.toFixed(1)} minutes`);
        
        // AGGRESSIVE FILTER: Only show if starting within 15 minutes or already started
        if (timeDiff <= 15) {
            console.log(`Card ${index}: Within 15 minutes - SHOWING`);
            card.style.display = 'block';
            card.dataset.matchStatus = timeDiff > 0 ? 'starting-soon' : 'live';
            
            // Update status badge if starting soon
            if (timeDiff > 0 && timeDiff <= 15 && liveStatusElement) {
                liveStatusElement.textContent = 'SOON';
                liveStatusElement.style.background = 'rgba(255, 193, 7, 0.2)';
                liveStatusElement.style.color = '#ffc107';
            }
        } else {
            console.log(`Card ${index}: More than 15 minutes away - HIDING`);
            card.style.display = 'none';
            card.dataset.matchStatus = 'upcoming';
            hiddenCount++;
        }
    });
    
    console.log(`Filter complete: ${hiddenCount} matches hidden`);
    return hiddenCount;
}

function parseTimeText(timeText) {
    console.log('Parsing time:', timeText);
    
    // Handle common time formats
    const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!timeMatch) {
        console.log('No time match found');
        return null;
    }
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3] ? timeMatch[3].toUpperCase() : '';
    
    console.log(`Parsed: ${hours}:${minutes} ${period}`);
    
    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    const now = new Date();
    const matchTime = new Date();
    matchTime.setHours(hours, minutes, 0, 0);
    
    // If the time appears to be in the past, assume it's for tomorrow
    if (matchTime < now) {
        matchTime.setDate(matchTime.getDate() + 1);
        console.log('Time appears to be in past, assuming tomorrow');
    }
    
    console.log('Final match time:', matchTime.toString());
    return matchTime;
}

function addFilterToggle() {
    // ----------------------------------------------------
    // NFL/American Football Check: Disable filter toggle if sport is American Football
    // ----------------------------------------------------
    if (isNflOrAmericanFootball()) {
        console.log('American Football sport detected. Filter toggle is DISABLED.');
        // Display a message that filtering is off
        const matchList = document.getElementById('match-list');
        if (matchList && !document.getElementById('nflFilterInfo')) {
             matchList.insertAdjacentHTML('beforebegin', `
                <div id="nflFilterInfo" style="
                    margin: 1rem 0;
                    padding: 1rem;
                    background: rgba(141, 185, 2, 0.1);
                    border: 1px solid rgba(141, 185, 2, 0.3);
                    border-radius: 8px;
                    text-align: center;
                    color: #8db902;
                    font-weight: bold;
                ">
                    Aggressive filter is disabled for American Football. All upcoming matches are shown.
                </div>
            `);
        }
        return; 
    }
    // ----------------------------------------------------

    if (document.getElementById('aggressiveFilterToggle')) return;
    
    const toggleHTML = `
        <div class="aggressive-filter-container" id="aggressiveFilterToggle" style="
            margin: 1rem 0;
            padding: 1rem;
            background: rgba(212, 32, 26, 0.1);
            border: 1px solid rgba(212, 32, 26, 0.3);
            border-radius: 8px;
            text-align: center;
        ">
            <button id="toggleFilterBtn" style="
                background: #d4201a;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                margin-bottom: 8px;
            ">
                <i class="fas fa-eye"></i> Show All Matches
            </button>
            <div style="font-size: 12px; color: #666;">
                Currently showing only LIVE and matches starting within 15 minutes
            </div>
        </div>
    `;
    
    const matchList = document.getElementById('match-list');
    if (matchList) {
        matchList.insertAdjacentHTML('beforebegin', toggleHTML);
        
        let showAll = false;
        const toggleBtn = document.getElementById('toggleFilterBtn');
        
        toggleBtn.addEventListener('click', function() {
            showAll = !showAll;
            
            if (showAll) {
                document.querySelectorAll('.match-card').forEach(card => {
                    card.style.display = 'block';
                });
                toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Upcoming Matches';
                toggleBtn.style.background = '#6c757d';
            } else {
                applyAggressiveFilter();
                toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Show All Matches';
                toggleBtn.style.background = '#d4201a';
            }
        });
    }
}

setInterval(() => {
    if (!isNflOrAmericanFootball() &&
        (!document.getElementById('toggleFilterBtn') || 
        document.getElementById('toggleFilterBtn').innerHTML.includes('Show All'))) {
        applyAggressiveFilter();
    }
}, 30000);

document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !isNflOrAmericanFootball()) {
        setTimeout(applyAggressiveFilter, 1000);
    }
});

console.log('Aggressive match filter initialized successfully!');
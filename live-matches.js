// Streamed.pk API Base URL
const STREAMED_API_BASE = "https://streamed.pk/api";

function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

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
  const sportName = getQueryParam("sportName") || "Sport";
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
        const textElements = cardamom.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span'); // Common text elements
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
// const BASE_URL = "http://localhost:7000/api/matches";
const BASE_URL = "https://reedstreams-backend.onrender.com";

function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function formatMatchTime(match) {
  try {
    if (match.raw_match_time) {
      const date = new Date(match.raw_match_time * 1000);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }
    if (match.start_time) {
      const date = new Date(match.start_time);
      if (!isNaN(date)) {
        return date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });
      }
    }
    return "N/A";
  } catch {
    return "N/A";
  }
}

async function loadLiveMatches() {
  const sport = getQueryParam("sport");
  const matchContainer = document.querySelector("#match-list");
  matchContainer.innerHTML = "Loading matches...";

  if (!sport) {
    matchContainer.innerHTML = `<p>No sport selected. Please go back and choose a sport.</p>`;
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/streams`);
    const response = await res.json();
    const data = Array.isArray(response.data?.streams) ? response.data.streams : [];

    const matches = data.filter(
      (m) => m.sport_name?.toLowerCase() === sport.toLowerCase() && m.match_status === "LIVE"
    );

    document.querySelector("#page-title").textContent =
      `${sport[0].toUpperCase() + sport.slice(1)} - Live Matches`;

    if (matches.length === 0) {
      matchContainer.innerHTML = `<p>No live matches currently for ${sport}.</p>`;
      return;
    }

    const matchesGrid = document.createElement("div");
    matchesGrid.className = "matches-grid";
    matchContainer.innerHTML = "";
    matchContainer.appendChild(matchesGrid);

    matches.forEach((match) => {
      const startTime = formatMatchTime(match);

      const matchCard = document.createElement("div");
      matchCard.className = "match-card";
      matchCard.innerHTML = `
        <div class="match-header">
          <h4>${match.competition_name || "N/A"}</h4>
          <span class="live-status">${match.match_status}</span>
        </div>
        <p>${match.home_name || "Home"} vs ${match.away_name || "Away"}</p>
        <p class="start-time">Started: ${startTime}</p>
        <button class="watch-link"
          data-stream-url="${encodeURIComponent(match.playurl2 || match.playurl1 || "")}"
          data-home-name="${match.home_name || ""}"
          data-away-name="${match.away_name || ""}"
          data-competition-name="${match.competition_name || ""}"
          data-start-time="${match.raw_match_time || match.start_time || ""}"
        >Watch Now</button>
      `;
      matchesGrid.appendChild(matchCard);
    });

    matchesGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".watch-link");
      if (!btn) return;

      const params = new URLSearchParams({
        streamUrl: btn.getAttribute("data-stream-url"),
        home_name: btn.getAttribute("data-home-name"),
        away_name: btn.getAttribute("data-away-name"),
        competition_name: btn.getAttribute("data-competition-name"),
        start_time: btn.getAttribute("data-start-time")
      });

      window.location.href = `match.html?${params.toString()}`;
    });
  } catch (err) {
    console.error("Error fetching matches:", err);
    matchContainer.innerHTML = "Failed to load matches.";
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
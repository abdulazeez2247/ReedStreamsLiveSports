// Streamed.pk API Base URL
const STREAMED_API_BASE = "https://streamed.pk/api";

// Sport icon mapping
const sportIcons = {
  football: "fas fa-futbol",
  soccer: "fas fa-futbol",
  basketball: "fas fa-basketball-ball",
  baseball: "fas fa-baseball-ball",
  hockey: "fas fa-hockey-puck",
  tennis: "fas fa-table-tennis",
  mma: "fas fa-hand-fist",
  boxing: "fas fa-hand-fist",
  cricket: "fas fa-cricket",
  rugby: "fas fa-football-ball",
  motorsport: "fas fa-flag-checkered",
  racing: "fas fa-flag-checkered",
  default: "fas fa-trophy"
};

// Function to get appropriate icon for a sport
function getSportIcon(sportName) {
  if (!sportName) return sportIcons.default;
  const normalized = sportName.toLowerCase();
  return sportIcons[normalized] || sportIcons.default;
}

// Function to capitalize sport name
function capitalizeSportName(sport) {
  if (!sport || typeof sport !== "string") return "Unknown Sport";
  return sport.charAt(0).toUpperCase() + sport.slice(1);
}

// ======== FETCH SPORTS FROM STREAMED.PK API =========
async function fetchSports() {
  try {
    const res = await fetch(`${STREAMED_API_BASE}/sports`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const sports = await res.json();
    return Array.isArray(sports) ? sports : [];
  } catch (err) {
    console.error("Error fetching sports:", err);
    return [];
  }
}

// ======== RENDER SPORT CARDS =========
async function renderSportCards() {
  const container = document.querySelector("#sports-container");
  if (!container) return;
  
  container.innerHTML = '<div class="loading-message">Loading sports...</div>';

  const sports = await fetchSports();

  if (sports.length === 0) {
    container.innerHTML = '<p class="error-message">Unable to load sports. Please try again later.</p>';
    return;
  }

  container.innerHTML = "";

  // Fetch match counts for each sport in parallel
  const matchCountPromises = sports.map(sport => fetchMatchCountForSport(sport.id));
  const matchCounts = await Promise.all(matchCountPromises);

  sports.forEach((sport, index) => {
    const iconClass = getSportIcon(sport.name);
    const matchCount = matchCounts[index];
    
    const card = document.createElement("div");
    card.className = "category-card";
    card.dataset.sportId = sport.id;
    card.dataset.sportName = sport.name;

    card.innerHTML = `
      <div class="category-icon"><i class="${iconClass}"></i></div>
      <h3 class="category-name">${capitalizeSportName(sport.name)}</h3>
      <div class="category-matches">${matchCount} Live ${matchCount === 1 ? 'Match' : 'Matches'}</div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `live-matches.html?sportId=${sport.id}&sportName=${encodeURIComponent(sport.name)}`;
    });

    container.appendChild(card);
  });
}

// ======== FETCH MATCH COUNT FOR A SPORT =========
async function fetchMatchCountForSport(sportId) {
  try {
    const res = await fetch(`${STREAMED_API_BASE}/matches/${sportId}`);
    if (!res.ok) return 0;
    const matches = await res.json();
    return Array.isArray(matches) ? matches.length : 0;
  } catch (err) {
    console.error(`Error fetching match count for sport ${sportId}:`, err);
    return 0;
  }
}

// Initialize on page load
renderSportCards();

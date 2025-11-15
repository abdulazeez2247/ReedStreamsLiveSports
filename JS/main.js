// Streamed.pk API Base URL
const STREAMED_API_BASE = "https://streamed.pk/api";

// Sport icon mapping
const sportIcons = {
  football: "⚽",
  "americanfootball": "🏈",
  basketball: "🏀",
  baseball: "⚾",
  hockey: "🏒",
  tennis: "🎾",
  mma: "🥊",
  boxing: "🥊", 
  cricket: "🏏",
  rugby: "🏉",
  motorsport: "🏁",
  racing: "🏎️",
  volleyball: "🏐",
  golf: "⛳",
  darts: "🎯",
};

// Sport name mapping
const sportNames = {
  football: "Soccer",
  "americanfootball": "Football",
  soccer: "Soccer",
  basketball: "Basketball",
  baseball: "Baseball",
  hockey: "Ice Hockey",
  tennis: "Tennis",
  mma: "MMA / UFC",
  boxing: "Boxing",
  cricket: "Cricket",
  rugby: "Rugby",
  motorsport: "Auto Racing",
  racing: "Auto Racing",
  volleyball: "Volleyball",
  golf: "Golf",
  darts: "Darts",
};

// Normalize sport name key
function normalizeSportKey(sportName) {
  if (!sportName) return '';
  return sportName.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '');
}

// Get sport icon
function getSportIcon(sportName) {
  if (!sportName) return undefined;
  const normalizedKey = normalizeSportKey(sportName);
  
  if (normalizedKey.includes('fight')) return sportIcons.mma;
  
  if (sportIcons[normalizedKey]) {
    return sportIcons[normalizedKey]; 
  }

  if (normalizedKey.includes('football')) return sportIcons.football;

  return undefined; 
}

// Get display sport name
function getDisplaySportName(sport) {
  if (!sport || typeof sport !== "string") return capitalizeSportName(sport);
  const normalizedKey = normalizeSportKey(sport);
  
  if (normalizedKey.includes('fight')) return sportNames.mma;
  
  if (sportNames[normalizedKey]) {
    return sportNames[normalizedKey];
  }

  return capitalizeSportName(sport);
}

// Capitalize sport name
function capitalizeSportName(sport) {
  if (!sport || typeof sport !== "string") return "Unknown Sport";
  return sport.charAt(0).toUpperCase() + sport.slice(1);
}

// Check if match has started
function hasMatchStarted(dateString) {
  try {
    if (!dateString) return false;
    const matchTime = new Date(dateString);
    const currentTime = new Date();
    return matchTime <= currentTime;
  } catch {
    return false;
  }
}

// Filter live matches
function filterLiveMatches(matches) {
  if (!Array.isArray(matches)) return [];

  return matches.filter(match => {
    const hasSources = match.sources && Array.isArray(match.sources) && match.sources.length > 0;
    const isLive = hasMatchStarted(match.date);
    return hasSources && isLive;
  });
}

// Fetch sports from API
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

// Fetch match count for sport
async function fetchMatchCountForSport(sportId) {
  try {
    const res = await fetch(`${STREAMED_API_BASE}/matches/${sportId}`);
    if (!res.ok) return 0;
    
    const matches = await res.json();
    
    if (!Array.isArray(matches) || matches.length === 0) {
      return 0;
    }

    const filteredMatches = filterLiveMatches(matches); 
    return filteredMatches.length; 
  } catch (err) {
    console.error(`Error fetching match count for sport ${sportId}:`, err);
    return 0;
  }
}

// Render sport cards
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

  const matchCountPromises = sports.map(sport => fetchMatchCountForSport(sport.id));
  const matchCounts = await Promise.all(matchCountPromises);

  sports.forEach((sport, index) => {
    const iconClass = getSportIcon(sport.name);
    const displayName = getDisplaySportName(sport.name); 
    const matchCount = matchCounts[index];
    
    if (!iconClass) {
      console.warn(`Skipping card: No icon mapping for sport: ${sport.name}.`);
      return; 
    }
    
    const card = document.createElement("div");
    card.className = "category-card";
    card.dataset.sportId = sport.id;
    card.dataset.sportName = sport.name;

    card.innerHTML = `
      <div class="category-icon">${iconClass}</div> 
      <h3 class="category-name">${displayName}</h3>
      <div class="category-matches">${matchCount} Live ${matchCount === 1 ? 'Match' : 'Matches'}</div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `live-matches.html?sportId=${sport.id}&sportName=${encodeURIComponent(sport.name)}`;
    });

    container.appendChild(card);
  });
}

// Initialize on page load
renderSportCards();
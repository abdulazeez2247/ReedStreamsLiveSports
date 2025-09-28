const BASE_URL = "https://reedstreams-backend.onrender.com/api/matches";
const allowedSports = ["football", "baseball", "amfootball", "MMA"];

const sportIcons = {
  football: "fas fa-futbol",
  amfootball: "fas fa-football-ball",
  baseball: "fas fa-baseball-ball",
  MMA: "fas fa-hand-fist",
};

const sportDisplayNames = {
  football: "Soccer",
  amfootball: "NFL",
  baseball: "Baseball",
  MMA: "MMA",
};

function capitalizeSportName(sport) {
  if (!sport || typeof sport !== "string") return "Unknown Sport";
  return sportDisplayNames[sport] || sport.charAt(0).toUpperCase() + sport.slice(1);
}

// ======== RENDER EMPTY CARDS =========
function renderEmptyCards() {
  const container = document.querySelector("#sports-container");
  container.innerHTML = "";

  allowedSports.forEach((sport) => {
    const iconClass = sportIcons[sport] || "fas fa-trophy";
    const card = document.createElement("div");
    card.className = "category-card";
    card.dataset.sport = sport; // for easy updating later

    card.innerHTML = `
      <div class="category-icon"><i class="${iconClass}"></i></div>
      <h3 class="category-name">${capitalizeSportName(sport)}</h3>
      <div class="category-matches">Loading...</div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `live-matches.html?sport=${sport}`;
    });

    container.appendChild(card);
  });
}

// ======== UPDATE COUNTS AFTER FETCH =========
async function updateMatchCounts() {
  const container = document.querySelector("#sports-container");

  try {
    const res = await fetch(`${BASE_URL}/streams`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const response = await res.json();

    const data = Array.isArray(response.data?.streams)
      ? response.data.streams
      : [];

    // Group LIVE matches by sport
    const grouped = {};
    data.forEach((match) => {
      const sport = match?.sport_name?.toLowerCase();
      if (
        sport &&
        allowedSports.includes(sport) &&
        match.match_status?.toUpperCase() === "LIVE"
      ) {
        grouped[sport] = (grouped[sport] || []).concat(match);
      }
    });

    // Update counts in existing cards
    allowedSports.forEach((sport) => {
      const count = grouped[sport]?.length || 0;
      const card = container.querySelector(`[data-sport="${sport}"]`);
      if (card) {
        card.querySelector(".category-matches").textContent =
          `${count} Live Matches`;
      }
    });
  } catch (err) {
    console.error("Error loading sports:", err);
    // Optional: show an error on each card
    allowedSports.forEach((sport) => {
      const card = container.querySelector(`[data-sport="${sport}"]`);
      if (card) {
        card.querySelector(".category-matches").textContent =
          "Failed to load";
      }
    });
  }
}
renderEmptyCards();
updateMatchCounts();

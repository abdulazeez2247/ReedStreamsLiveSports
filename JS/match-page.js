// Streamed.pk API Base URL
const STREAMED_API_BASE = "https://streamed.pk/api";

// Function to check if match has started (current time >= match time)
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

// Function to get time until match starts (for debugging/info)
function getTimeUntilMatch(dateString) {
  try {
    if (!dateString) return "Unknown time";
    const matchTime = new Date(dateString);
    const currentTime = new Date();
    const timeDiff = matchTime - currentTime;
    
    if (timeDiff <= 0) return "Match has started";
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `Starts in ${hours}h ${minutes}m`;
  } catch {
    return "Unknown time";
  }
}

function formatMatchTime(dateString) {
  try {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date)) return null;
    
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return null;
  }
}

// Function to get team badge image URL
function getTeamBadgeUrl(badgeId) {
  if (!badgeId) return null;
  return `${STREAMED_API_BASE}/images/badge/${badgeId}.webp`;
}

// Function to render detailed match information
function renderMatchDetails(matchData) {
  const detailsContainer = document.getElementById("match-details-container");
  const titleElement = document.getElementById("match-title");

  if (!detailsContainer || !titleElement) return;

  // Check if match has started
  if (!hasMatchStarted(matchData.date)) {
    const startTimeFormatted = formatMatchTime(matchData.date);
    const timeUntilMatch = getTimeUntilMatch(matchData.date);
    
    detailsContainer.innerHTML = `
      <div class="upcoming-match-message">
        <i class="far fa-clock"></i>
        <h3>Match Hasn't Started Yet</h3>
        <p class="match-schedule">Scheduled: ${startTimeFormatted || 'Unknown time'}</p>
        <p class="time-until">${timeUntilMatch}</p>
        <div class="upcoming-actions">
          <button onclick="window.history.back()" class="back-button">
            <i class="fas fa-arrow-left"></i> Back to Matches
          </button>
        </div>
      </div>
    `;
    
    titleElement.innerHTML = `
      ${matchData.title || "Upcoming Match"}
      <span class="upcoming-badge"><span><i class="far fa-clock"></i> UPCOMING</span></span>
    `;
    return;
  }

  const homeTeam = matchData.teams?.home;
  const awayTeam = matchData.teams?.away;
  
  titleElement.innerHTML = `
    ${matchData.title || `${homeTeam?.name || "Home"} vs ${awayTeam?.name || "Away"}`}
    <span class="live-badge"><span><i class="fas fa-circle"></i> LIVE</span></span>
  `;

  const startTimeFormatted = formatMatchTime(matchData.date);

  let detailsHtml = `
    <div class="match-details-wrapper">
      <div class="match-teams-display">
        <div class="team-detail home">
          ${homeTeam && homeTeam.badge ? `
            <img src="${getTeamBadgeUrl(homeTeam.badge)}" alt="${homeTeam.name}" class="team-badge-large" onerror="this.style.display='none'">
          ` : ''}
          <h3 class="team-name-large">${homeTeam?.name || "Home Team"}</h3>
        </div>
        
        <div class="match-vs">
          <span class="vs-text">VS</span>
        </div>
        
        <div class="team-detail away">
          ${awayTeam && awayTeam.badge ? `
            <img src="${getTeamBadgeUrl(awayTeam.badge)}" alt="${awayTeam.name}" class="team-badge-large" onerror="this.style.display='none'">
          ` : ''}
          <h3 class="team-name-large">${awayTeam?.name || "Away Team"}</h3>
        </div>
      </div>
      
      <div class="match-info-section">
        ${startTimeFormatted ? `<p class="match-date"><i class="far fa-calendar"></i> ${startTimeFormatted}</p>` : ''}
        ${matchData.competition ? `<p class="match-competition"><i class="fas fa-trophy"></i> ${matchData.competition}</p>` : ''}
        ${matchData.stadium ? `<p class="match-stadium"><i class="fas fa-map-marker-alt"></i> ${matchData.stadium}</p>` : ''}
      </div>

      ${matchData.lineup ? renderLineup(matchData.lineup) : ''}
    </div>
  `;

  detailsContainer.innerHTML = detailsHtml;
}

// Function to render team lineups if available
function renderLineup(lineup) {
  if (!lineup) return '';
  
  let lineupHtml = '<div class="lineup-section">';
  lineupHtml += '<h4 class="lineup-title"><i class="fas fa-users"></i> Team Lineups</h4>';
  lineupHtml += '<div class="lineup-container">';
  
  if (lineup.home) {
    lineupHtml += `
      <div class="lineup-team">
        <h5>Home Team</h5>
        <ul class="player-list">
          ${lineup.home.map(player => `
            <li class="player-item">
              <span class="player-number">${player.number || '-'}</span>
              <span class="player-name">${player.name}</span>
              ${player.position ? `<span class="player-position">${player.position}</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
  
  if (lineup.away) {
    lineupHtml += `
      <div class="lineup-team">
        <h5>Away Team</h5>
        <ul class="player-list">
          ${lineup.away.map(player => `
            <li class="player-item">
              <span class="player-number">${player.number || '-'}</span>
              <span class="player-name">${player.name}</span>
              ${player.position ? `<span class="player-position">${player.position}</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
  
  lineupHtml += '</div></div>';
  return lineupHtml;
}

// --- NEW/MODIFIED FUNCTIONS START HERE ---

/**
 * Function to fetch ALL streams from ALL available match sources concurrently.
 * @param {Array<Object>} matchSources - Array of { source, id } objects from matchData.sources.
 * @returns {Promise<Array<Object>>} - A promise that resolves to a flattened array of all stream objects.
 */
async function fetchAllMatchStreams(matchSources) {
  if (!matchSources || matchSources.length === 0) return [];
  
  // Create an array of fetch promises for every single match source (alpha, bravo, charlie, etc.)
  const streamPromises = matchSources.map(source => 
    fetchStream(source.source, source.id)
      .catch(err => {
        // Catch errors for a single source without failing Promise.all
        console.error(`Failed to load stream from source ${source.source}:`, err);
        return []; // Return an empty array to be combined later
      })
  );
  
  // Wait for all fetches to complete
  const resultsArray = await Promise.all(streamPromises);
  
  // Flatten the array of arrays into a single list of all stream objects
  const allStreams = resultsArray.flat().filter(stream => stream && stream.embedUrl);
  
  // Add a property to identify the source of the stream (helpful for users)
  // We'll map over them to ensure stream.source property is clear (e.g., alpha stream 1, bravo stream 1)
  const finalStreams = [];
  matchSources.forEach((matchSource, index) => {
      const streamsFromSource = resultsArray[index];
      if (Array.isArray(streamsFromSource)) {
          streamsFromSource.forEach(stream => {
              // Ensure source identifier is part of the stream data for the selector
              finalStreams.push({
                  ...stream,
                  sourceIdentifier: matchSource.source // Add new property to use in selector
              });
          });
      }
  });

  return finalStreams;
}

// Function to fetch stream data from API (Remains the same)
async function fetchStream(source, id) {
  try {
    const res = await fetch(`${STREAMED_API_BASE}/stream/${source}/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const streams = await res.json();
    // API returns an array of stream objects
    return streams;
  } catch (err) {
    // console.error("Error fetching stream:", err); // Suppressing error for better Promise.all handling
    return null;
  }
}

// Function to fetch stream sources and play (MODIFIED)
async function fetchAndPlayStream(matchData, videoElement) {
  // Check if match has started before trying to play stream
  if (!hasMatchStarted(matchData.date)) {
    console.log("Match hasn't started yet, skipping stream load");
    return;
  }

  if (!matchData.sources || matchData.sources.length === 0) {
    showStreamError("No match sources available for this match.");
    return;
  }

  // 1. Fetch all streams from all match sources concurrently
  const allStreams = await fetchAllMatchStreams(matchData.sources);
  
  if (allStreams.length === 0) {
    showStreamError("Unable to load any stream data from all available sources. Please try again later.");
    return;
  }

  // 2. Select the best stream for initial playback
  // Try to find an HD stream first, otherwise use the first available
  const hdStream = allStreams.find(s => s.hd === true);
  const selectedStream = hdStream || allStreams[0];
  
  console.log(`Loading stream from source ${selectedStream.sourceIdentifier} - Stream #${selectedStream.streamNo} (${selectedStream.language}) - ${selectedStream.hd ? 'HD' : 'SD'}`);
  
  // 3. Create iframe for embed URL
  createStreamIframe(selectedStream.embedUrl, videoElement);
  
  // 4. Show stream selector with ALL combined streams
  createStreamSelector(allStreams, videoElement);
}

// Function to create stream selector for multiple streams (MODIFIED for stability)
function createStreamSelector(streams, videoElement) {
  // The container here is NOT used for insertion, only for reference.
  const container = videoElement?.parentElement || document.querySelector('.video-section'); 
  
  // Check if selector already exists
  // We look for it globally since we are inserting it outside the video section
  const existingSelector = document.querySelector('.stream-selector');
  if (existingSelector) {
      existingSelector.remove();
  }
  
  const selector = document.createElement('div');
  selector.className = 'stream-selector';
  selector.innerHTML = `
    <div class="stream-selector-header">
      <i class="fas fa-tv"></i> Available Streams (${streams.length})
    </div>
    <div class="stream-options">
      ${streams.map((stream, index) => `
        <button class="stream-option" 
                data-embed-url="${stream.embedUrl}" 
                data-stream-index="${index}" 
                title="Source: ${stream.sourceIdentifier || 'Unknown'}">
          <span class="stream-number">${stream.sourceIdentifier || 'Source'} #${stream.streamNo}</span>
          <span class="stream-lang">${stream.language}</span>
          ${stream.hd ? '<span class="stream-quality hd">HD</span>' : '<span class="stream-quality sd">SD</span>'}
        </button>
      `).join('')}
    </div>
  `;
  
  // --- START OF CRITICAL STABILITY FIX ---
  const videoSectionContainer = document.querySelector('.video-section');

  if (videoSectionContainer) {
      // CRITICAL: Insert the source buttons AFTER the stable video wrapper.
      // This solves both the disappearance and the shifting problems.
      videoSectionContainer.insertAdjacentElement('afterend', selector); 
  } else {
      // Fallback: append to the body if the wrapper isn't found
      document.body.appendChild(selector);
  }
  // --- END OF CRITICAL STABILITY FIX ---
  
  // Add click handlers for stream options
  selector.querySelectorAll('.stream-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const embedUrl = btn.getAttribute('data-embed-url');
      createStreamIframe(embedUrl, videoElement);
      
      // Update active state
      selector.querySelectorAll('.stream-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Set the first option as active (matching the one loaded initially)
  const firstOption = selector.querySelector('.stream-option');
  if (firstOption) {
    firstOption.classList.add('active');
  }
}

// Function to create stream iframe (Remains the same)
function createStreamIframe(embedUrl, videoElement) {
  // Hide the video element
  if (videoElement) {
    videoElement.style.display = 'none';
  }
  
  // Create iframe container
  const container = videoElement?.parentElement || document.querySelector('.video-section');
  
  // Remove any existing iframe
  const existingIframe = container.querySelector('.stream-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }
  
  const iframe = document.createElement('iframe');
  iframe.className = 'stream-iframe video-player';
  iframe.src = embedUrl;
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('frameborder', '0');
  
  container.insertBefore(iframe, videoElement || container.firstChild);
}

// Function to show stream error (Remains the same)
function showStreamError(message) {
  const videoElement = document.getElementById("video-player");
  if (videoElement) {
    videoElement.style.display = "none";
  }
  
  const container = document.querySelector(".video-section") || document.querySelector(".container");
  
  // Remove existing error message before adding a new one
  const existingError = container?.querySelector('.stream-error-message');
  if (existingError) {
    existingError.remove();
  }

  const errorElement = document.createElement('div');
  errorElement.className = "stream-error-message";
  errorElement.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <p>${message}</p>
  `;
  container?.insertBefore(errorElement, container.firstChild);
}

// Initialize match page (Remains the same)
async function initMatchPage() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get("matchId");

    if (!matchId) {
      // Try to get match data from sessionStorage
      const storedMatch = sessionStorage.getItem('currentMatch');
      if (storedMatch) {
        const matchData = JSON.parse(storedMatch);
        renderMatchDetails(matchData);
        await fetchAndPlayStream(matchData, document.getElementById("video-player"));
      } else {
        showError("No match selected. Please go back and select a match.");
      }
      return;
    }

    // Get match data from sessionStorage
    const storedMatch = sessionStorage.getItem('currentMatch');
    if (storedMatch) {
      const matchData = JSON.parse(storedMatch);
      renderMatchDetails(matchData);
      await fetchAndPlayStream(matchData, document.getElementById("video-player"));
    } else {
      showError("Match data not found. Please go back and select a match again.");
    }
  } catch (e) {
    console.error("Initialization error:", e);
    showError("An error occurred while loading the match.");
  }
}

function showError(message) {
  const titleElement = document.getElementById("match-title");
  const detailsContainer = document.getElementById("match-details-container");
  
  if (titleElement) {
    titleElement.textContent = "Error";
  }
  
  if (detailsContainer) {
    detailsContainer.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
        <button onclick="window.history.back()" class="back-button">
          <i class="fas fa-arrow-left"></i> Back to Matches
        </button>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", initMatchPage);
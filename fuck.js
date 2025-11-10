// Streamed.pk API Base URL
const STREAMED_API_BASE = "https://streamed.pk/api";

// Simple filter system
function createFilterButtons() {
    console.log('Creating filter buttons...');
    
    // Create buttons HTML
    const buttonsHTML = `
    <div class="filter-buttons" style="
        display: flex; 
        justify-content: center; 
        gap: 1rem; 
        margin: 2rem auto;
        padding: 0 1rem;
        max-width: 1200px;
    ">
        <button class="filter-btn active" onclick="filterMatches('all')" style="
            background: #8db902;
            color: #0a0e17;
            border: none;
            padding: 10px 20px;
            border-radius: 7px;
            font-weight: 600;
            cursor: pointer;
        ">
            All Matches
        </button>
        <button class="filter-btn" onclick="filterMatches('live')" style="
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 7px;
            font-weight: 600;
            cursor: pointer;
        ">
            Live
        </button>
        <button class="filter-btn" onclick="filterMatches('upcoming')" style="
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 7px;
            font-weight: 600;
            cursor: pointer;
        ">
            Upcoming
        </button>
    </div>
    `;
    
    // Insert buttons
    const matchesGrid = document.getElementById('match-list');
    if (matchesGrid) {
        matchesGrid.insertAdjacentHTML('beforebegin', buttonsHTML);
        console.log('Filter buttons added!');
    }
}

function filterMatches(filterType) {
    console.log('Filtering:', filterType);
    
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.textContent.includes(filterType) || (filterType === 'all' && btn.textContent.includes('All'))) {
            btn.style.background = '#8db902';
            btn.style.color = '#0a0e17';
        } else {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.color = 'white';
        }
    });
    
    // Filter matches based on actual time comparison
    const matches = document.querySelectorAll('.match-card');
    const now = new Date();
    
    matches.forEach(match => {
        const dateText = match.querySelector('.date').textContent;
        const timeText = match.querySelector('.time').textContent;
        
        // If it says "LIVE" in date, it's live
        const isLive = dateText === 'LIVE';
        
        // If not live, check if it's upcoming or past
        let isUpcoming = false;
        if (!isLive && timeText) {
            // Create date object from the match time
            const matchTime = new Date();
            const [time, modifier] = timeText.split(' ');
            let [hours, minutes] = time.split(':');
            
            hours = parseInt(hours);
            minutes = parseInt(minutes);
            
            // Convert to 24-hour format
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            
            matchTime.setHours(hours, minutes, 0, 0);
            
            // If match time is in the future, it's upcoming
            isUpcoming = matchTime > now;
        }
        
        if (filterType === 'all') {
            match.style.display = 'flex';
        } else if (filterType === 'live') {
            match.style.display = isLive ? 'flex' : 'none';
        } else if (filterType === 'upcoming') {
            match.style.display = (!isLive && isUpcoming) ? 'flex' : 'none';
        }
    });
}

// Your existing match loading function
async function loadLiveMatches() {
    const sportId = getQueryParam("sportId");
    const sportName = getQueryParam("sportName") || "Live";
    const matchContainer = document.getElementById("match-list");
    
    matchContainer.innerHTML = '<div class="loading-message">Loading live matches...</div>';

    try {
        let apiUrl = `${STREAMED_API_BASE}/matches`;
        if (sportId) {
            apiUrl = `${STREAMED_API_BASE}/matches/${sportId}`;
        }

        const res = await fetch(apiUrl);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const matches = await res.json();

        if (!Array.isArray(matches) || matches.length === 0) {
            matchContainer.innerHTML = `<div class="no-matches">No live matches currently available. Check back later!</div>`;
            return;
        }

        matchContainer.innerHTML = '';

        matches.forEach((match) => {
            const {date, time} = formatMatchDateTime(match.date);
            const homeTeam = match.teams?.home;
            const awayTeam = match.teams?.away;
            const homeBadgeUrl = getTeamBadgeUrl(homeTeam?.badge);
            const awayBadgeUrl = getTeamBadgeUrl(awayTeam?.badge);

            const matchCard = document.createElement("div");
            matchCard.className = "match-card";
            matchCard.dataset.matchId = match.id;
            matchCard.dataset.matchData = JSON.stringify(match);
            
            // Add live tag only if match is currently happening
            const now = new Date();
            const matchDate = new Date(match.date);
            const isLive = matchDate <= now && matchDate > new Date(now.getTime() - 3 * 60 * 60 * 1000); // Within last 3 hours
            
            matchCard.innerHTML = `
                ${isLive ? '<div class="live-tag">LIVE</div>' : ''}
                <div class="teams-container">
                    <div class="team home">
                        <div class="team-badge-container">
                            ${homeBadgeUrl ? `<img src="${homeBadgeUrl}" alt="${homeTeam?.name || 'Team'}" class="team-logo" onerror="this.style.display='none'">` : '<div class="team-placeholder">?</div>'}
                        </div>
                        <span class="team-abbr" title="${homeTeam?.name || 'Unknown'}">${getTeamAbbr(homeTeam?.name)}</span>
                    </div>
                    <div class="match-center">
                        ${match.competition ? `<div class="competition">${match.competition}</div>` : ''}
                        <div class="date">${isLive ? 'LIVE' : date}</div>
                        <div class="vs-line"></div>
                        ${time ? `<div class="time">${time}</div>` : ''}
                    </div>
                    <div class="team away">
                        <div class="team-badge-container">
                            ${awayBadgeUrl ? `<img src="${awayBadgeUrl}" alt="${awayTeam?.name || 'Team'}" class="team-logo" onerror="this.style.display='none'">` : '<div class="team-placeholder">?</div>'}
                        </div>
                        <span class="team-abbr" title="${awayTeam?.name || 'Unknown'}">${getTeamAbbr(awayTeam?.name)}</span>
                    </div>
                </div>
            `;
            matchContainer.appendChild(matchCard);
        });

        // ADD FILTER BUTTONS AFTER MATCHES ARE LOADED
        setTimeout(() => {
            createFilterButtons();
        }, 100);

    } catch (err) {
        console.error("Error fetching matches:", err);
        matchContainer.innerHTML = '<div class="error-message">Failed to load matches. Please try again later.</div>';
    }
}

// Your existing helper functions
function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

function formatMatchDateTime(dateString) {
    try {
        if (!dateString) return {date: "LIVE", time: ""};
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return {date: "LIVE", time: ""};
        
        const now = new Date();
        const isLive = date <= now && date > new Date(now.getTime() - 3 * 60 * 60 * 1000);
        
        if (isLive) {
            return {date: "LIVE", time: ""};
        }
        
        const dateStr = date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });
        const timeStr = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
        
        return {date: dateStr, time: timeStr};
    } catch {
        return {date: "LIVE", time: ""};
    }
}

function getTeamBadgeUrl(badgeId) {
    if (!badgeId) return null;
    return `${STREAMED_API_BASE}/images/badge/${badgeId}.webp`;
}

function getTeamAbbr(name) {
    return name ? name.substring(0, 10).toUpperCase() : '???';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadLiveMatches();
});
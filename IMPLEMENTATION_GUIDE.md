# Streamed.pk API Implementation Guide

This guide explains how the Streamed.pk API has been integrated into the Reedstreams Live Sports website.

## Overview

The website now uses the Streamed.pk API to provide:
- Dynamic sport categories
- Real-time match listings
- Team badges and logos
- Live streaming with multiple sources
- Player lineups (when available)

## File Changes

### 1. main.js
**Purpose:** Handles home page sport categories

**Key Changes:**
- Removed hardcoded sport list
- Added `fetchSports()` to get sports from API
- Added `fetchMatchCountForSport()` to show live match counts
- Dynamic icon mapping for various sports
- Updated navigation to pass sportId instead of sport name

**Functions:**
```javascript
fetchSports() // Fetches available sports
renderSportCards() // Displays sport cards dynamically
fetchMatchCountForSport(sportId) // Gets match count for each sport
getSportIcon(sportName) // Maps sport to appropriate icon
```

### 2. live-matches.js
**Purpose:** Displays matches for selected sport

**Key Changes:**
- Updated to use `sportId` instead of `sport` parameter
- Added team badge display functionality
- Stores match data in sessionStorage for detail page
- Enhanced match card UI with team logos

**Functions:**
```javascript
loadLiveMatches() // Fetches and displays matches
getTeamBadgeUrl(badgeId) // Generates badge image URL
createTeamBadgeHTML(team, side) // Creates team display HTML
```

**New Features:**
- Team badges displayed for home and away teams
- VS separator between teams
- Better visual hierarchy
- Responsive team display

### 3. match-page.js
**Purpose:** Shows match details and stream

**Key Changes:**
- Complete rewrite to use Streamed.pk API
- Fetch streams from `/api/stream/{source}/{id}`
- Display team badges in large format
- Show match information (date, competition, stadium)
- Render player lineups if available
- Multiple stream source support

**Functions:**
```javascript
renderMatchDetails(matchData) // Displays match info
renderLineup(lineup) // Shows player lineups
fetchAndPlayStream(matchData, videoElement) // Gets and plays stream
fetchStream(source, id) // Fetches stream from API
createStreamIframe(embedUrl, videoElement) // Embeds stream
showStreamError(message) // Handles stream errors
```

**New Features:**
- Large team badges
- Team names prominently displayed
- Match metadata (date, competition, stadium)
- Player lineup section with numbers and positions
- Graceful error handling for streams

### 4. live-matches.html
**Purpose:** Match listing page styling

**Key Changes:**
- Added CSS for team badge display
- Styles for team info containers
- VS separator styling
- Responsive design for mobile
- Loading and error message styles

**New CSS Classes:**
- `.teams-container` - Container for team display
- `.team-info` - Individual team information
- `.team-badge` - Team logo/badge image
- `.team-name` - Team name text
- `.vs-separator` - VS text between teams
- `.team-placeholder` - Fallback when no badge

### 5. match.html
**Purpose:** Match detail page styling

**Key Changes:**
- Enhanced match details styling
- Large team badge display
- Player lineup styles
- Stream error message styling
- Mobile responsive layouts

**New CSS Classes:**
- `.match-details-wrapper` - Main container
- `.match-teams-display` - Team comparison layout
- `.team-badge-large` - Large team badges
- `.match-info-section` - Match metadata
- `.lineup-section` - Player lineup container
- `.player-list` - Player list styling
- `.stream-error-message` - Error display

## URL Parameters

### live-matches.html
**Before:**
```
live-matches.html?sport=football
```

**After:**
```
live-matches.html?sportId=1&sportName=football
```

### match.html
**Before:**
```
match.html?streamUrl=...&home_name=...&away_name=...
```

**After:**
```
match.html?matchId=12345
```
(Match data stored in sessionStorage)

## Data Flow Diagram

```
Home Page (index.html)
    ↓
    ├─ main.js
    │   ├─ Fetch sports from /api/sports
    │   ├─ Fetch match counts for each sport
    │   └─ Display sport cards
    ↓
User clicks sport
    ↓
Live Matches Page (live-matches.html)
    ↓
    ├─ live-matches.js
    │   ├─ Get sportId from URL
    │   ├─ Fetch matches from /api/matches/{sportId}
    │   ├─ Display match cards with badges
    │   └─ Store match data in sessionStorage
    ↓
User clicks "Watch Now"
    ↓
Match Detail Page (match.html)
    ↓
    ├─ match-page.js
    │   ├─ Get match data from sessionStorage
    │   ├─ Display team info and badges
    │   ├─ Fetch stream from /api/stream/{source}/{id}
    │   ├─ Display player lineups (if available)
    │   └─ Embed stream in iframe
```

## API Response Handling

### Sports Response
```javascript
// Expected format
[
  { id: "1", name: "football" },
  { id: "2", name: "basketball" }
]
```

### Matches Response
```javascript
// Expected format
[
  {
    id: "12345",
    title: "Team A vs Team B",
    date: "2025-10-22T15:30:00Z",
    teams: {
      home: { name: "Team A", badge: "badge-id-1" },
      away: { name: "Team B", badge: "badge-id-2" }
    },
    sources: [
      { source: "source1", id: "stream-id-1" }
    ]
  }
]
```

### Stream Response
```javascript
// Expected format
{
  embedUrl: "https://provider.com/embed/12345"
}
```

## Error Handling

### Network Errors
- Display user-friendly messages
- Don't crash the application
- Provide fallback content

### Missing Data
- Show placeholders for missing badges
- Display "Unknown" for missing team names
- Hide sections with no data (e.g., lineups)

### Stream Failures
- Try multiple sources if available
- Show error message if all sources fail
- Provide option to go back

## Mobile Responsiveness

All pages are fully responsive with breakpoints at:
- 768px (tablet)
- 480px (mobile)

**Mobile Optimizations:**
- Vertical team layout
- Rotated VS separator
- Single column lineups
- Touch-friendly buttons
- Optimized badge sizes

## Testing Checklist

- [ ] Sports load on home page
- [ ] Match counts display correctly
- [ ] Clicking sport navigates to matches
- [ ] Matches display with team badges
- [ ] Team badges load correctly
- [ ] Clicking "Watch Now" navigates to match page
- [ ] Match details display properly
- [ ] Team badges show in large format
- [ ] Stream embeds successfully
- [ ] Player lineups display (if available)
- [ ] Error messages show when appropriate
- [ ] Mobile layouts work correctly
- [ ] Navigation works throughout

## Browser Console

Watch for these console messages during testing:

**Success:**
```
Fetching sports...
Fetching matches for sport 1...
Fetching stream from source1...
```

**Errors:**
```
Error fetching sports: [error details]
Error fetching matches: [error details]
Failed to load stream from source: [error details]
```

## Troubleshooting

### Sports not loading
- Check network tab for API call
- Verify API is accessible
- Check console for errors

### Badges not showing
- Verify badge ID is correct
- Check image URL in network tab
- Ensure WebP support in browser

### Streams not playing
- Check if match has sources
- Verify stream API endpoint
- Look for CORS issues
- Check embed URL validity

### Match data missing
- Verify sessionStorage has data
- Check if coming from matches page
- Ensure proper navigation flow

## Deployment Notes

1. No server-side changes needed
2. All API calls are client-side
3. Ensure CORS is handled by API
4. Test in production environment
5. Monitor API rate limits
6. Check error tracking

## Support

For issues with the Streamed.pk API integration, refer to:
- API Documentation: https://streamed.pk/docs
- This implementation guide
- Browser console errors
- Network tab for API responses


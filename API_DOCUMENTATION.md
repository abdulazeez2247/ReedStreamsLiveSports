
This document provides details about the Streamed.pk Scrapper API integration implemented in this project.

## API Base URL
```


## Endpoints Used

### 1. Get Sports Categories
**Endpoint:** `/sports`  
**Method:** GET  
**Description:** Fetches all available sports categories.

**Response:**
```json
[
  {
    "id": "1",
    "name": "football"
  },
  {
    "id": "2",
    "name": "basketball"
  }
]
```

**Implementation:**
- File: `main.js`
- Function: `fetchSports()`
- Used on: Home page (`index.html`)

---

### 2. Get Matches for a Sport
**Endpoint:** `/matches/{sportId}`  
**Method:** GET  
**Description:** Retrieves all live matches for a specific sport.

**Parameters:**
- `sportId` (path parameter): The sport ID from the sports endpoint

**Response:**
```json
[
  {
    "id": "12345",
    "title": "Team A vs Team B",
    "date": "2025-10-22T15:30:00Z",
    "teams": {
      "home": {
        "name": "Team A",
        "badge": "team-a-badge-id"
      },
      "away": {
        "name": "Team B",
        "badge": "team-b-badge-id"
      }
    },
    "sources": [
      {
        "source": "source1",
        "id": "stream-id-1"
      }
    ],
    "competition": "Premier League",
    "stadium": "Stadium Name"
  }
]
```

**Implementation:**
- File: `live-matches.js`
- Function: `loadLiveMatches()`
- Used on: Live matches page (`live-matches.html`)

---

### 3. Get Team Badge
**Endpoint:** `/images/badge/{badgeId}.webp`  
**Method:** GET  
**Description:** Retrieves team badge/logo image.

**Parameters:**
- `badgeId` (path parameter): The badge ID from the team object

**Response:** Image file (WebP format)

**Implementation:**
- Files: `live-matches.js`, `match-page.js`
- Function: `getTeamBadgeUrl(badgeId)`
- Used on: Match listings and match detail pages

---

### 4. Get Stream Data
**Endpoint:** `/stream/{source}/{id}`  
**Method:** GET  
**Description:** Retrieves available streams for a specific match from a specific source.

**Parameters:**
- `source` (path parameter): The stream source identifier (alpha, bravo, charlie, delta, echo, foxtrot, golf, hotel, intel)
- `id` (path parameter): The source-specific stream ID

**Available Sources:**
- Alpha: `/stream/alpha/{id}`
- Bravo: `/stream/bravo/{id}`
- Charlie: `/stream/charlie/{id}`
- Delta: `/stream/delta/{id}`
- Echo: `/stream/echo/{id}`
- Foxtrot: `/stream/foxtrot/{id}`
- Golf: `/stream/golf/{id}`
- Hotel: `/stream/hotel/{id}`
- Intel: `/stream/intel/{id}`

**Response:** Array of stream objects
```json
[
  {
    "id": "stream_456",
    "streamNo": 1,
    "language": "English",
    "hd": true,
    "embedUrl": "https://embed.example.com/watch?v=abcd1234",
    "source": "alpha"
  },
  {
    "id": "stream_457",
    "streamNo": 2,
    "language": "Spanish",
    "hd": false,
    "embedUrl": "https://embed.example.com/watch?v=efgh5678",
    "source": "alpha"
  }
]
```

**Stream Object Properties:**
- `id` (string): Unique identifier for the stream
- `streamNo` (number): Stream number/index
- `language` (string): Stream language (e.g., "English", "Spanish")
- `hd` (boolean): Whether the stream is in HD quality
- `embedUrl` (string): URL that can be used to embed the stream in an iframe
- `source` (string): Source identifier

**Implementation:**
- File: `match-page.js`
- Functions: 
  - `fetchStream(source, id)` - Fetches stream array
  - `fetchAndPlayStream(matchData, videoElement)` - Tries sources until one works
  - `createStreamSelector(streams, videoElement)` - Creates UI for multiple streams
- Used on: Match streaming page (`match.html`)

**Usage Notes:**
- API returns an **array** of streams, not a single stream
- Multiple streams may be available (different languages/qualities)
- HD streams are preferred when available
- Users can switch between streams using the stream selector UI

---

## Features Implemented

### 1. Dynamic Sports Loading
- Sports are loaded dynamically from the API
- Match counts are displayed for each sport
- Automatic icon mapping based on sport name

### 2. Sport-Specific Match Listings
- Matches filtered by selected sport
- Team badges displayed for each match
- Real-time match information

### 3. Enhanced Match Details Page
- Large team badges
- Team names and competition information
- Match date and stadium (if available)
- Player lineups (if available)
- Live stream embedding

### 4. Team Badge Display
- Team logos fetched from Images API
- Fallback handling for missing images
- Responsive sizing for different screen sizes

### 5. Stream Integration
- Multiple stream sources support (alpha, bravo, charlie, etc.)
- Automatic HD stream selection when available
- Stream selector UI for multiple language/quality options
- Embed-based streaming using iframe
- Error handling for unavailable streams
- Fallback to next source if primary fails

---

## Error Handling

### API Errors
- Network failures: Display user-friendly error messages
- Empty responses: Show "No matches available" message
- Invalid data: Graceful degradation with fallback content

### Stream Errors
- No sources available: Display error message
- Stream loading failure: Try next available source
- Embed errors: Show fallback error UI

---

## Data Flow

1. **Home Page (index.html)**
   - Load sports from `/api/sports`
   - Fetch match counts for each sport
   - Display sport cards with match counts

2. **Live Matches Page (live-matches.html)**
   - Get sportId from URL parameters
   - Fetch matches from `/api/matches/{sportId}`
   - Display match cards with team badges
   - Store match data in sessionStorage on click

3. **Match Detail Page (match.html)**
   - Retrieve match data from sessionStorage
   - Display team information and badges
   - Fetch stream from `/api/stream/{source}/{id}`
   - Embed stream using iframe

---

## Session Storage

### currentMatch
Stores the complete match object when navigating to the match detail page.

**Structure:**
```json
{
  "id": "12345",
  "title": "Team A vs Team B",
  "date": "2025-10-22T15:30:00Z",
  "teams": { ... },
  "sources": [ ... ],
  "lineup": { ... }
}
```

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features used
- WebP image support required for team badges
- Iframe support required for streaming

---

## Performance Considerations

1. **Parallel Requests**: Match counts fetched in parallel for better performance
2. **Lazy Loading**: Images loaded only when needed
3. **Error Recovery**: Failed requests don't block UI
4. **Session Storage**: Reduces API calls by storing match data locally

---

## Future Enhancements

- Add caching for sports and matches
- Implement search functionality across all matches
- Add favorites/bookmarking feature
- Support for multiple stream quality options
- Live score updates
- Match statistics and commentary


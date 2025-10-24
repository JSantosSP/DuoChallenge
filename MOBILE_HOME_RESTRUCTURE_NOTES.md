# Mobile Home Screen Restructure - Documentation

## Overview
The mobile Home screen has been restructured from a conditional UI (showing different views based on active games) to a **unified dashboard** that always displays all sections regardless of game state.

## Date
2025-10-24

---

## Changes Summary

### Previous Behavior
- **With active games**: Showed stats, active games list, and quick action buttons
- **Without active games**: Showed only empty state with join/generate buttons
- Other sections (prizes, history, statistics) were hidden when no games were active

### New Behavior
The Home screen now **always displays all sections**:
1. **📊 Statistics Card** - Quick overview of completed games, prizes, and active games
2. **🎁 My Prizes** - Horizontal scrollable list of won prizes (up to 3 preview)
3. **🕹️ Active Games** - List of all active game sessions
4. **🧾 Game History** - Recent completed games (up to 3 preview)
5. **🔗 Game Actions** - Buttons to join or generate games
6. **📊 More Options** - Access to personal data and prize management

Each section shows an **empty state message** when no data is available, ensuring the UI is always informative.

---

## Modified Files

### 1. `/workspace/mobile/src/screens/HomeScreen.js`

**Key Changes:**
- Added `useWonPrizes` hook import to fetch won prizes
- Added `gameHistory` state and `fetchGameHistory()` function
- Updated `useFocusEffect` to refresh all data sources (active games, stats, prizes, history)
- Updated `onRefresh()` to reload all sections
- Removed conditional rendering based on `hasActiveGames`
- Added always-visible sections for prizes, active games, history, and actions
- Added empty state handling for each individual section
- Added horizontal scrolling for prize preview
- Added "See all" links for prizes and history sections

**New UI Sections:**
```javascript
// Always visible sections:
1. Stats Card (completedGames, prizesWon, activeGames)
2. My Prizes Section (horizontal scroll, 3 preview items)
3. Active Games Section (full list or empty state)
4. Game History Section (3 preview items)
5. Game Actions Section (Join/Generate buttons)
6. More Options Section (MyData, MyPrizes navigation)
```

**New Styles Added:**
- `sectionHeader` - Header with title and "See all" link
- `seeAllText` - Link text styling
- `emptySection` - Empty state container for each section
- `emptySectionText` - Empty state message styling
- `prizeCard` - Horizontal prize card
- `prizeEmoji`, `prizeTitle`, `prizeUsed` - Prize card content
- `historyCard` - Compact history item card
- `historyIcon`, `historyInfo`, `historyType`, `historyDate`, `historyStatus`, `historyProgress` - History card elements

---

## API Endpoints Used

### Active Endpoints
All endpoints are already implemented in the backend and are being used:

| Endpoint | Method | Description | Hook/Function |
|----------|--------|-------------|---------------|
| `/api/game/active` | GET | Get user's active games | `useGame.activeGames` |
| `/api/game/stats` | GET | Get user game statistics | `useGame.stats` |
| `/api/game/history?status=completed` | GET | Get completed games | `useGame.getHistory()` |
| `/api/prizes/won` | GET | Get won prizes | `useWonPrizes.wonPrizes` |
| `/api/game/generate` | POST | Generate new game | `useGame.generateGame()` |
| `/api/share/join` | POST | Join game with code | Navigation to JoinGameScreen |

### Response Data Structures

#### Active Games (`/api/game/active`)
```json
{
  "data": {
    "games": [
      {
        "_id": "gameSetId",
        "shareCode": "ABC123",
        "progress": 60,
        "completedLevels": ["levelId1", "levelId2"],
        "totalLevels": 5,
        "startedAt": "2025-10-20T10:00:00Z",
        "status": "active"
      }
    ]
  }
}
```

#### Game Stats (`/api/game/stats`)
```json
{
  "data": {
    "completedGames": 3,
    "prizesWon": 2,
    "activeGames": 1,
    "totalGames": 4
  }
}
```

#### Game History (`/api/game/history?status=completed`)
```json
{
  "data": {
    "games": [
      {
        "_id": "gameSetId",
        "shareCode": "XYZ789",
        "progress": 100,
        "completedAt": "2025-10-22T15:30:00Z",
        "startedAt": "2025-10-20T10:00:00Z",
        "status": "completed",
        "prizeId": "prizeId123"
      }
    ]
  }
}
```

#### Won Prizes (`/api/prizes/won`)
```json
{
  "data": {
    "prizes": [
      {
        "_id": "prizeId",
        "title": "Cena romántica",
        "description": "Una cena especial en tu restaurante favorito",
        "imagePath": "/uploads/prizes/cena.jpg",
        "weight": 5,
        "used": false,
        "completedAt": "2025-10-22T15:30:00Z"
      }
    ]
  }
}
```

---

## Hooks Used

### 1. `useGame` (from `/workspace/mobile/src/hooks/useGame.js`)
```javascript
const { 
  activeGames,        // Array of active GameSets
  activeGamesLoading, // Loading state
  stats,              // Game statistics object
  refetchActiveGames, // Refetch active games
  refetchStats,       // Refetch statistics
  generateGame,       // Generate new game function
  getHistory          // Get game history function (async)
} = useGame();
```

### 2. `useWonPrizes` (from `/workspace/mobile/src/hooks/useGame.js`)
```javascript
const { 
  wonPrizes,  // Array of won prizes
  refetch     // Refetch won prizes
} = useWonPrizes();
```

### 3. `useAuth` (from `/workspace/mobile/src/context/AuthContext.js`)
```javascript
const { user } = useAuth(); // Current user object
```

---

## Data Refresh Strategy

### On Screen Focus
Using `useFocusEffect` from React Navigation, all data sources are refreshed when the screen becomes visible:

```javascript
useFocusEffect(
  React.useCallback(() => {
    refetchActiveGames();    // Refresh active games
    refetchStats();          // Refresh statistics
    refetchWonPrizes();      // Refresh won prizes
    fetchGameHistory();      // Refresh game history
  }, [])
);
```

### Pull-to-Refresh
All data sources are refreshed in parallel using `Promise.all`:

```javascript
const onRefresh = async () => {
  setRefreshing(true);
  await Promise.all([
    refetchActiveGames(), 
    refetchStats(), 
    refetchWonPrizes(),
    fetchGameHistory()
  ]);
  setRefreshing(false);
};
```

---

## Navigation Routes

The Home screen now provides navigation to:

| Button/Section | Destination Screen | Purpose |
|----------------|-------------------|---------|
| Prize Card | `WonPrizes` | View all won prizes |
| "Ver todos" (Prizes) | `WonPrizes` | View all won prizes |
| Active Game Card | `GameDetail` | Continue playing game |
| "Ver todos" (History) | `GameHistory` | View full game history |
| "Unirse a un Juego" | `JoinGame` | Enter code to join game |
| "Generar Mi Juego" | - | Generate new game (inline) |
| "Mis Datos Personales" | `MyData` | Manage personal data |
| "Mis Premios (Creados)" | `MyPrizes` | Manage created prizes |

---

## Empty State Handling

Each section has its own empty state with contextual messages:

### My Prizes Section
```
"Aún no tienes premios ganados. ¡Completa juegos para ganar premios!"
```

### Active Games Section
```
"No tienes juegos activos. ¡Únete a uno o genera uno nuevo!"
```

### Game History Section
```
"No has completado juegos aún. ¡Empieza uno para ver tu historial!"
```

---

## UI/UX Improvements

### Design Patterns
1. **Consistent Section Headers** - All sections have emoji icons and clear titles
2. **Preview + See All Pattern** - Prizes and History show 3 items with "Ver todos" link
3. **Horizontal Scrolling** - Prize cards scroll horizontally for better space utilization
4. **Card-based Layout** - All items use elevated cards with shadows
5. **Color Consistency** - Primary pink (#FF6B9D) used for accents and CTAs
6. **Empty States** - Gray background boxes with helpful messages

### Accessibility
- All interactive elements have clear labels
- Touch targets are properly sized (minimum 44x44 points)
- Color contrast meets accessibility standards
- Empty states provide clear guidance for next actions

### Performance
- Parallel data fetching using `Promise.all`
- Limited preview items (3) to reduce initial render load
- Horizontal scrolling for prizes to show more without vertical space
- React Query caching for all data sources

---

## Testing Considerations

### Test Scenarios
1. **Empty State Flow**
   - New user with no games, no prizes, no history
   - Verify all sections show empty states
   - Verify action buttons are accessible

2. **Single Active Game**
   - User with 1 active game
   - Verify game card displays correctly
   - Verify stats are accurate

3. **Multiple Active Games**
   - User with 3+ active games
   - Verify all games are shown
   - Verify scrolling works properly

4. **Won Prizes Display**
   - User with 1-3 prizes: all shown in horizontal scroll
   - User with 4+ prizes: first 3 shown + "Ver todos" link

5. **Game History Display**
   - User with 1-3 completed games: all shown
   - User with 4+ completed games: first 3 shown + "Ver todos" link

6. **Data Refresh**
   - Test pull-to-refresh
   - Test screen focus refresh
   - Test after completing a game
   - Test after winning a prize

---

## Future Enhancements (Optional)

### Possible Improvements
1. **Statistics Detail Screen** - Dedicated screen for detailed stats and charts
2. **Prize Categories** - Filter won prizes by category
3. **Game Progress Chart** - Visual progress indicator for each active game
4. **Quick Start** - One-tap game generation from empty state
5. **Achievements/Badges** - Gamification elements based on stats
6. **Social Sharing** - Share completed games to social media
7. **Notifications** - Push notifications for game invites

---

## Dependencies

### React Native Libraries
- `@react-navigation/native` - Navigation and focus effects
- `@tanstack/react-query` - Data fetching and caching
- `react-native-safe-area-context` - Safe area handling

### Custom Components
- `AppButton` - Reusable button component
- `LoadingOverlay` - Loading state indicator

---

## Known Issues / Limitations

### None Currently
All required endpoints exist and are functional. No feature gaps detected.

---

## Conclusion

The Home screen restructure successfully transforms the mobile app's landing page from a conditional UI into a comprehensive dashboard that always provides visibility into all aspects of the user's gaming experience. This improves discoverability, reduces user confusion, and creates a more cohesive experience regardless of the user's current game state.

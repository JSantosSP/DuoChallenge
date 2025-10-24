# Game Restart Refactor - Documentation

## 📋 Overview

This document describes the refactoring of the "restart game" functionality in the mobile app to align with the new GameShare architecture. The main goal is to ensure that game restarts use existing GameShare codes rather than creating games from the user's own data.

---

## 🔄 Changes Summary

### **Old Flow**
1. User completes a game and receives a prize
2. User clicks "Restart Game" from Settings or Prize screen
3. System abandons all active games
4. System generates a **new game using the user's own data**
5. This created confusion and didn't align with the shared game concept

### **New Flow**
1. User completes a game that was created from a GameShare code
2. User clicks "Restart Game" from the Prize screen
3. System retrieves the original GameShare code from the completed game
4. System calls `/api/share/join` with the original code
5. Backend validates the code is still active
6. If valid: creates a new GameSet using the **original creator's data**
7. If invalid: shows controlled error message

---

## 🎯 Key Principles

1. ✅ **Restart = Rejoin**: Restarting a game means rejoining it using the original share code
2. ✅ **Creator's Data Only**: Games always use the creator's data, never the player's own data
3. ✅ **Active Code Required**: Restart only works if the original share code is still active
4. ✅ **Per-Game Restart**: Restart is now per-game, not a global action
5. ❌ **No Self-Games**: Users cannot restart games created with their own data

---

## 📂 Files Modified

### **1. Mobile App - Hooks**

#### `/mobile/src/hooks/useGame.js`

**Changes:**
- Renamed `resetMutation` to `restartGameMutation`
- Changed logic from calling `/api/game/reset` to calling `/api/share/join`
- Added `shareCode` parameter requirement
- Added comprehensive error handling for:
  - Invalid/expired codes
  - Attempting to use own code
  - Generic errors
- Updated return value from `resetGame` to `restartGame`

**Old Logic:**
```javascript
const resetMutation = useMutation({
  mutationFn: () => apiService.resetGame(),
  onSuccess: () => {
    // Invalidate queries and show generic success message
  },
});
```

**New Logic:**
```javascript
const restartGameMutation = useMutation({
  mutationFn: async ({ shareCode }) => {
    if (!shareCode) {
      throw new Error('Este juego no tiene un código de compartición válido');
    }
    return apiService.joinGame(shareCode);
  },
  onSuccess: (response) => {
    // Invalidate queries and show detailed success with new game info
  },
  onError: (error) => {
    // Comprehensive error handling with specific messages
  },
});
```

---

### **2. Mobile App - Screens**

#### `/mobile/src/screens/PrizeScreen.js`

**Changes:**
- Added `shareCode` parameter from route params
- Updated `handleNewGame` to use `restartGame({ shareCode })`
- Added validation to prevent restart if no shareCode exists
- Shows appropriate error messages for non-shared games
- Passes `shareCode` to the Prize screen from GameDetailScreen

**Key Addition:**
```javascript
const handleNewGame = async () => {
  if (!shareCode) {
    Alert.alert(
      'No se puede reiniciar',
      'Este juego no tiene un código de compartición válido. Solo puedes reiniciar juegos compartidos por otra persona.',
      [{ text: 'Entendido', onPress: () => navigation.navigate('Home') }]
    );
    return;
  }

  try {
    await restartGame({ shareCode });
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  } catch (error) {
    console.error('Error restarting game:', error);
  }
};
```

---

#### `/mobile/src/screens/GameDetailScreen.js`

**Changes:**
- Updated navigation to Prize screen to include `shareCode` parameter
- This ensures the Prize screen knows which code to use for restart

**Before:**
```javascript
onPress={() => navigation.navigate('Prize', { gameSetId: gameSet._id })}
```

**After:**
```javascript
onPress={() => navigation.navigate('Prize', { 
  gameSetId: gameSet._id,
  shareCode: gameSet.shareCode
})}
```

---

#### `/mobile/src/screens/SettingsScreen.js`

**Changes:**
- **Removed** the global "Restart Game" action
- **Removed** `handleResetGame` function
- **Removed** `resetGame` from useGame destructuring

**Rationale:**
- Global restart doesn't make sense in the new architecture
- Each game should be restarted individually from its own screen
- Prevents confusion about which game is being restarted

---

#### `/mobile/src/screens/WonPrizesScreen.js`

**Changes:**
- Added prize reactivation functionality (see Prize Logic section below)
- Added "Reactivate Prize" button for each used prize
- Added "Reactivate All" button for bulk reactivation
- Added loading states and error handling
- Imported `AppButton` component for consistent UI

---

### **3. Mobile App - API Service**

#### `/mobile/src/api/api.js`

**Changes:**
- Added `reactivatePrize(id)` endpoint call
- Added `reactivateAllPrizes()` endpoint call

**Note:** These endpoints don't exist in the backend yet - see "Missing Backend Endpoints" section below.

---

## 🎁 Prize Reactivation Logic

As part of this refactor, prize reset/reactivation logic has been moved from the game flow to the prize management screens.

### **Previous State**
- No prize reactivation logic existed in the codebase
- Once a prize was marked as "used", it remained that way permanently

### **New Implementation**

#### **Location:** `WonPrizesScreen.js`

#### **Features:**
1. **Individual Prize Reactivation**
   - Each used prize now has a "🔄 Reactivar Premio" button
   - Clicking shows a confirmation dialog
   - Calls `/api/prizes/{id}/reactivate` endpoint
   - Updates the prize status to unused

2. **Bulk Reactivation**
   - "Reactivar Todos los Premios Canjeados" button appears when there are used prizes
   - Reactivates all used prizes at once
   - Calls `/api/prizes/reactivate-all` endpoint
   - Shows count of prizes to be reactivated

3. **Visual Indicators**
   - Used prizes show "✓ Canjeado" badge
   - Stats card shows: Total / Canjeados / Disponibles
   - Reactivate button only appears on used prizes

4. **Error Handling**
   - Loading states while reactivating
   - Success messages with emoji
   - Error messages from backend
   - Automatic refresh after successful reactivation

---

## 🔌 Backend Endpoints Used

### **Existing Endpoints (Used)**

#### `POST /api/share/join`
- **Used for:** Restarting games
- **Parameters:** `{ code: string }`
- **Response:** New GameSet created from the original creator's data
- **Validations:**
  - Code must exist and be active
  - Code must not be expired
  - User cannot use their own code
  - Code must not have reached max uses

#### `GET /api/game/active`
- **Used for:** Getting list of active games with shareCode info
- **Response:** Array of active GameSets with populated shareId

---

### **Missing Backend Endpoints** ⚠️

The following endpoints are referenced in the mobile app but **do not exist yet** in the backend:

#### `PUT /api/prizes/{id}/reactivate`
- **Purpose:** Reactivate a single used prize
- **Required functionality:**
  - Mark prize as unused (`used: false`)
  - Clear `usedAt` timestamp
  - Return updated prize
  - Validate prize belongs to requesting user

#### `PUT /api/prizes/reactivate-all`
- **Purpose:** Reactivate all used prizes for the current user
- **Required functionality:**
  - Find all prizes where `used: true` and user matches
  - Set `used: false` for all
  - Clear `usedAt` timestamps
  - Return count of reactivated prizes

**Recommendation:** Create these endpoints in `/backend/src/controllers/prize.controller.js` and add routes in `/backend/src/routes/prize.routes.js`

---

## 🚫 Deprecated/Removed

### **Endpoint: POST /api/game/reset**
- **Status:** Still exists in backend but should be considered deprecated
- **Reason:** Creates games from user's own data, which contradicts the new architecture
- **Recommendation:** Remove or repurpose this endpoint
- **Used by:** Nothing in the mobile app anymore

### **Function: resetGame()**
- **Status:** Removed from mobile app
- **Location:** Was in `useGame.js` and used by `SettingsScreen.js` and `PrizeScreen.js`
- **Replaced by:** `restartGame({ shareCode })`

---

## ✅ Validations Implemented

### **Frontend Validations**

1. **ShareCode Presence**
   - Checks if game has a shareCode before allowing restart
   - Shows friendly error if missing

2. **User Feedback**
   - Different error messages for different failure scenarios:
     - "Código Inactivo" - when code is expired/invalid
     - "Acción No Permitida" - when trying to use own code
     - Generic error for other failures

3. **Loading States**
   - Shows loading indicators during restart
   - Disables buttons while processing
   - Prevents double-submission

### **Backend Validations** (existing)

1. **Code Validity**
   - Verifies code exists in database
   - Checks `active: true` status
   - Validates expiration date if set

2. **User Restrictions**
   - Prevents user from joining own game
   - Tracks usage count
   - Enforces max uses limit

---

## 🔄 New User Flow Examples

### **Example 1: Successful Restart**
```
1. User completes game from partner's shared code "ABC123"
2. User sees prize screen with "Iniciar Nuevo Juego" button
3. User clicks button
4. System validates code "ABC123" is still active
5. System calls /api/share/join with "ABC123"
6. Backend creates new GameSet with partner's data
7. User returns to Home screen with new active game
8. Success message shows new game has been created
```

### **Example 2: Expired Code**
```
1. User completes game from partner's shared code "XYZ789"
2. Partner has since deactivated the code
3. User clicks "Iniciar Nuevo Juego"
4. System calls /api/share/join with "XYZ789"
5. Backend returns 404 "Código no válido o expirado"
6. User sees error: "El código ya no está activo. Pide a tu pareja que genere uno nuevo."
7. User returns to Home screen
```

### **Example 3: Own Game (Should Not Happen)**
```
1. User generates own game (using /api/game/generate)
2. User completes the game
3. User clicks "Iniciar Nuevo Juego"
4. System detects no shareCode
5. User sees error: "Este juego no tiene un código de compartición válido"
6. User is directed to join a shared game instead
```

---

## 🎨 UI/UX Improvements

### **Prize Screen**
- Now receives `shareCode` parameter
- Shows context-aware error messages
- Prevents accidental restarts of non-shared games

### **Won Prizes Screen**
- New "Premios Canjeados" section with stats
- Individual reactivation buttons on used prizes
- Bulk "Reactivar Todos" action button
- Clear visual distinction between used and available prizes
- Loading states during reactivation

### **Settings Screen**
- Cleaner interface without confusing global restart option
- Focuses on actual settings and navigation
- Removed restart-related confusion

---

## 📊 Impact Analysis

### **Positive Changes**
✅ Aligns with GameShare architecture  
✅ Prevents creation of "orphan" games from user data  
✅ Clear separation between game restart and prize management  
✅ Better error handling and user feedback  
✅ Scalable: users can have multiple games from different codes  
✅ Prize reactivation is now explicit and controlled  

### **Breaking Changes**
⚠️ Users can no longer globally "restart" all their games  
⚠️ Games without shareCode cannot be restarted  
⚠️ Old games created before this change may not have shareCode  

### **Backend Requirements**
🔧 Need to implement prize reactivation endpoints  
🔧 Consider deprecating `/api/game/reset` endpoint  
🔧 Ensure all GameSets properly store shareCode  

---

## 🧪 Testing Recommendations

### **Manual Testing Scenarios**

1. **Complete and restart a shared game**
   - Join game with code
   - Complete all levels
   - Restart from prize screen
   - Verify new game is created with same creator's data

2. **Try to restart with expired code**
   - Join game with code
   - Have creator deactivate code
   - Try to restart
   - Verify appropriate error message

3. **Prize reactivation**
   - Win and use a prize
   - Navigate to Won Prizes screen
   - Reactivate individual prize
   - Verify prize is marked as available again

4. **Bulk prize reactivation**
   - Have multiple used prizes
   - Click "Reactivar Todos"
   - Verify all prizes are reactivated

### **Edge Cases**

- ⚠️ Game with no shareCode
- ⚠️ ShareCode that has reached max uses
- ⚠️ Network failure during restart
- ⚠️ Backend endpoint errors
- ⚠️ Reactivating prize that was already reactivated

---

## 🔮 Future Improvements

### **Suggested Enhancements**

1. **Share Code Management**
   - Show expiration dates on codes
   - Allow extending code validity
   - Show usage statistics per code

2. **Game History**
   - Track which games were created from which codes
   - Show "family tree" of game instances
   - Allow restarting from history view

3. **Prize Management**
   - Set cooldown period for prize reactivation
   - Track reactivation history
   - Add prize categories and filtering

4. **Notifications**
   - Notify when someone joins your game
   - Alert when code is about to expire
   - Remind about unused prizes

---

## 📝 Migration Notes

### **For Existing Users**

Existing games created before this refactor may not have a `shareCode` associated with them. These games:
- Cannot be restarted using the new flow
- Should be marked as "legacy" games
- Users should be encouraged to join new shared games

### **Database Considerations**

Ensure all `GameSet` documents have:
- `shareId` field (reference to GameShare)
- `shareCode` field (string, for quick access)
- `creatorId` field (to distinguish creator vs player)

---

## 🐛 Known Issues

1. **Prize Reactivation Endpoints Missing**
   - Frontend calls exist but backend endpoints need to be created
   - Error handling is in place for when endpoints are added

2. **Legacy Games**
   - Older games without shareCode cannot use new restart flow
   - Need migration strategy or user communication

3. **Multiple Active Games**
   - User can have multiple active games from same code
   - UI should make it clear which game is which
   - Consider adding game nicknames or creation dates

---

## 👥 Developer Notes

### **Code Style**
- Used consistent error handling patterns
- Alert messages in Spanish (matching app language)
- Emoji usage for better UX (🔄 🎮 ✅ ❌)
- Comprehensive comments in code

### **Dependencies**
- No new npm packages required
- Uses existing React Query patterns
- Compatible with current navigation structure

### **Performance**
- Minimal impact on app performance
- Efficient query invalidation
- Optimistic UI updates where appropriate

---

## 📞 Support & Questions

For questions about this refactor, refer to:
- This document
- Code comments in modified files
- Git commit history for detailed changes

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-24  
**Author:** Cursor AI Assistant  
**Status:** ✅ Completed

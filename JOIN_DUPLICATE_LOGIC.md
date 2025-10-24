# Join Duplicate Logic - Technical Documentation

## 📋 Overview

This document explains how the system handles the case when a user attempts to join a GameShare code that they have already used previously. This is a critical feature for the "restart game" functionality.

---

## 🎯 Business Requirement

**Use Case:** A user completes a game that was created from a GameShare code and wants to restart it (create a new game from the same code).

**Expected Behavior:**
- User should be able to create multiple GameSets from the same GameShare code
- No error should occur when "rejoining" a code they've already used
- Each join creates a **new, independent GameSet** with fresh progress
- The original GameShare should track unique users but allow multiple joins

---

## 🔧 Current Implementation

### **Backend Logic**

**File:** `/backend/src/controllers/share.controller.js`  
**Function:** `joinGame()`  
**Lines:** 138-193

#### **Code Analysis:**

```javascript
const joinGame = async (req, res) => {
  try {
    const playerId = req.user._id;
    const { code } = req.body;

    // 1. Find the GameShare by code
    const gameShare = await GameShare.findOne({ code, active: true });
    
    if (!gameShare) {
      return res.status(404).json({
        success: false,
        message: 'Código no válido o expirado'
      });
    }

    // 2. Prevent self-join
    if (gameShare.creatorId.toString() === playerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes usar tu propio código'
      });
    }

    // 3. CHECK FOR DUPLICATE JOIN (Lines 159-169)
    const alreadyUsed = gameShare.usedBy.some(
      u => u.userId.toString() === playerId.toString()
    );

    // 4. HANDLE DUPLICATE: Only add to usedBy if first time
    if (!alreadyUsed) {
      gameShare.usedBy.push({
        userId: playerId,
        joinedAt: new Date()
      });
      await gameShare.save();
    }

    // 5. ALWAYS CREATE NEW GAMESET (regardless of duplicate)
    const gameSet = await generateNewGameSet(
      gameShare.creatorId,
      playerId,
      gameShare._id,
      code
    );

    await gameSet.populate('levels');

    res.json({
      success: true,
      message: 'Te has unido al juego exitosamente',
      data: { gameSet }
    });
  } catch (error) {
    // Error handling...
  }
};
```

---

## ✅ Key Features

### **1. Duplicate Detection (Lines 159-161)**

```javascript
const alreadyUsed = gameShare.usedBy.some(
  u => u.userId.toString() === playerId.toString()
);
```

**Purpose:** Check if the user has previously joined this GameShare

**Logic:**
- Searches the `usedBy` array for the current user's ID
- Returns `true` if user has joined before
- Returns `false` if this is their first join

---

### **2. Conditional Tracking (Lines 163-169)**

```javascript
if (!alreadyUsed) {
  gameShare.usedBy.push({
    userId: playerId,
    joinedAt: new Date()
  });
  await gameShare.save();
}
```

**Purpose:** Track unique users who have joined this GameShare

**Logic:**
- Only adds user to `usedBy` array on **first join**
- Subsequent joins from the same user **do not** add duplicate entries
- This keeps the `usedBy` array clean and represents **unique user count**

**Data Structure:**
```javascript
{
  _id: "gameShareId",
  code: "ABC123",
  creatorId: "userId1",
  usedBy: [
    {
      userId: "userId2",
      joinedAt: "2025-10-24T10:00:00Z"
    }
    // Only ONE entry per user, even if they join multiple times
  ],
  active: true
}
```

---

### **3. Always Create New GameSet (Lines 171-176)**

```javascript
const gameSet = await generateNewGameSet(
  gameShare.creatorId,
  playerId,
  gameShare._id,
  code
);
```

**Purpose:** Create a new game instance every time, regardless of duplicate

**Critical Behavior:**
- ✅ Executes **outside** the `if (!alreadyUsed)` block
- ✅ Creates a **new GameSet** even if user has joined before
- ✅ Each GameSet is independent with its own:
  - Progress tracking
  - Level completion states
  - Prize assignment
  - Start/completion dates

**Result:** User can have multiple active or completed GameSets from the same GameShare code

---

## 📊 Database Impact

### **GameShare Collection**

**Fields:**
```javascript
{
  code: String,              // e.g., "ABC123"
  creatorId: ObjectId,       // User who created the code
  active: Boolean,           // Can be used for new joins
  usedBy: [{
    userId: ObjectId,        // Unique users only
    joinedAt: Date
  }],
  maxUses: Number,           // Optional: limit total joins
  expiresAt: Date            // Optional: expiration date
}
```

**Behavior on Duplicate Join:**
- `usedBy.length` does **not** increase
- `usedBy` remains clean with unique users only

---

### **GameSet Collection**

**Fields:**
```javascript
{
  userId: ObjectId,          // Player (who is playing)
  creatorId: ObjectId,       // Creator (whose data is used)
  shareId: ObjectId,         // Reference to GameShare
  shareCode: String,         // Copy of code for quick access
  levels: [ObjectId],        // Array of Level IDs
  status: String,            // 'active', 'completed', 'abandoned'
  progress: Number,          // 0-100
  completedLevels: [ObjectId],
  prizeId: ObjectId,
  startedAt: Date,
  completedAt: Date
}
```

**Behavior on Duplicate Join:**
- **New document** is created every time
- Same user can have multiple GameSets with same `shareId`
- Each GameSet is completely independent

**Example:**
```javascript
// User joins code "ABC123" three times
[
  {
    _id: "gameSet1",
    userId: "player1",
    shareCode: "ABC123",
    status: "completed",
    progress: 100
  },
  {
    _id: "gameSet2",
    userId: "player1",
    shareCode: "ABC123",
    status: "abandoned",
    progress: 50
  },
  {
    _id: "gameSet3",
    userId: "player1",
    shareCode: "ABC123",
    status: "active",
    progress: 0
  }
]
```

---

## 🔄 Use Case Scenarios

### **Scenario 1: First Join**

```
1. User receives code "XYZ789" from partner
2. User calls /api/share/join with code="XYZ789"
3. Backend checks: alreadyUsed = false
4. Backend adds user to gameShare.usedBy
5. Backend creates new GameSet
6. Response: { success: true, gameSet: {...} }
```

**Result:**
- GameShare.usedBy has ONE entry for this user
- ONE GameSet created

---

### **Scenario 2: Restart Game (Duplicate Join)**

```
1. User completes game from code "XYZ789"
2. User clicks "Restart Game" and selects "XYZ789"
3. User calls /api/share/join with code="XYZ789"
4. Backend checks: alreadyUsed = true
5. Backend SKIPS adding to usedBy (already exists)
6. Backend creates NEW GameSet anyway
7. Response: { success: true, gameSet: {...} }
```

**Result:**
- GameShare.usedBy still has ONE entry (unchanged)
- TWO GameSets total (old + new)

---

### **Scenario 3: Multiple Restarts**

```
1. User joins "ABC123" → GameSet 1 created
2. User completes game → GameSet 1 status = "completed"
3. User restarts (joins again) → GameSet 2 created
4. User abandons game → GameSet 2 status = "abandoned"
5. User restarts again → GameSet 3 created
```

**Result:**
- GameShare.usedBy: 1 entry
- GameSets: 3 total (completed, abandoned, active)
- User can query by status to see current game

---

## ⚠️ Edge Cases

### **1. Max Uses Limit**

**Current Code (lines 113-118 in verifyShareCode):**
```javascript
if (gameShare.maxUses && gameShare.usedBy.length >= gameShare.maxUses) {
  return res.status(400).json({
    success: false,
    message: 'Este código ha alcanzado el máximo de usos'
  });
}
```

**Issue:** This check is NOT in `joinGame()`, only in `verifyShareCode()`

**Impact:**
- If `maxUses` is set and limit is reached by unique users
- Duplicate joins from existing users will still work
- This is actually **good behavior** for restart functionality

**Recommendation:** Keep as is - maxUses limits unique users, not total joins

---

### **2. Code Deactivation**

**What happens if creator deactivates code after user joins?**

```javascript
// In joinGame
const gameShare = await GameShare.findOne({ code, active: true });
```

**Behavior:**
- If `active: false`, join attempt fails
- User cannot restart game
- This is correct - prevents restarts from deactivated codes

**Frontend handling:** Shows error "El código ya no está activo"

---

### **3. Self-Join Prevention**

```javascript
if (gameShare.creatorId.toString() === playerId.toString()) {
  return res.status(400).json({
    success: false,
    message: 'No puedes usar tu propio código'
  });
}
```

**Behavior:**
- Users cannot join their own codes
- Prevents creating games from own data
- This is intentional and correct

---

## 🎨 Frontend Integration

### **Mobile App Usage**

#### **1. Settings Screen - Restart Game**

**File:** `/mobile/src/screens/SettingsScreen.js`

```javascript
const handleSelectShareCode = async (code) => {
  // No duplicate check needed - backend handles it
  await restartGame({ shareCode: code });
};
```

**Flow:**
1. User clicks "Reiniciar Juego"
2. Modal shows list of available GameShares
3. User selects a code
4. Frontend calls `joinGame(code)`
5. Backend creates new GameSet (handles duplicate internally)
6. Frontend navigates to new game

**Error Handling:**
- Code inactive → "El código ya no está activo"
- Own code → "No puedes usar tu propio código"
- No error for duplicate join ✅

---

#### **2. Prize Screen - Restart This Game**

**File:** `/mobile/src/screens/PrizeScreen.js`

```javascript
const handleNewGame = async () => {
  if (!shareCode) {
    Alert.alert('No se puede reiniciar', 'Este juego no tiene código...');
    return;
  }

  await restartGame({ shareCode });
  navigation.navigate('Home');
};
```

**Flow:**
1. User completes game and sees prize
2. Prize screen receives `shareCode` from completed game
3. User clicks "Reiniciar este Juego"
4. Frontend calls `joinGame(shareCode)`
5. Backend creates new GameSet from same code
6. User returns to home with new active game

---

## 📈 Analytics & Tracking

### **Unique Users vs Total Joins**

**Unique Users:**
```javascript
const uniqueUsers = gameShare.usedBy.length;
```

**Total Joins (GameSets created):**
```javascript
const totalJoins = await GameSet.countDocuments({ 
  shareId: gameShare._id 
});
```

**Restart Rate:**
```javascript
const restartRate = totalJoins / uniqueUsers;
// > 1.0 means users are restarting games
```

---

## 🔒 Security Considerations

### **Potential Issues:**

1. **Spam Prevention**
   - User could create unlimited GameSets from one code
   - **Mitigation:** Rate limiting could be added
   - **Current status:** Not implemented, but low risk

2. **Database Growth**
   - Many GameSets could be created
   - **Mitigation:** Automatic cleanup of old abandoned games
   - **Current status:** Not implemented

3. **Creator Spam**
   - Code creator could be spammed by one user restarting many times
   - **Mitigation:** Could add per-user-per-code daily limit
   - **Current status:** Not needed yet

---

## ✅ Best Practices

### **For Developers:**

1. **Never prevent duplicate joins** in backend
   - Allow users to create multiple GameSets
   - This is essential for restart functionality

2. **Keep usedBy array clean**
   - Only add user once to usedBy
   - Use for unique user count only

3. **Validate code status**
   - Always check `active: true`
   - Respect expiration dates

4. **Handle errors gracefully**
   - Don't expose "duplicate join" as error
   - Treat it as normal behavior

### **For Frontend:**

1. **Don't check for duplicates**
   - Let backend handle it
   - Always call `/api/share/join`

2. **Cache shareCode in completed games**
   - Store in GameSet for easy restart
   - Pass to Prize screen

3. **Show appropriate messages**
   - "Crear nuevo juego" not "Unirse"
   - Makes restart intent clear

---

## 🧪 Testing Checklist

- [ ] User can join new code successfully
- [ ] User can rejoin same code (restart)
- [ ] User can rejoin multiple times
- [ ] usedBy only has one entry per user
- [ ] New GameSet created each time
- [ ] Old GameSets remain unchanged
- [ ] Cannot join own code
- [ ] Cannot join inactive code
- [ ] Error messages are user-friendly
- [ ] Multiple active games work correctly

---

## 📝 Summary

**The duplicate join logic is simple and elegant:**

1. ✅ **Detect** if user has joined before
2. ✅ **Skip** adding duplicate entry to usedBy
3. ✅ **Always create** new GameSet
4. ✅ **Return success** every time (if code is valid)

This allows seamless game restarts without errors while keeping the GameShare tracking clean and accurate.

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-24  
**Status:** ✅ Implemented and Working

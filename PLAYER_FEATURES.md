# Player Features Documentation

## Overview
The Soundscape player has been upgraded with advanced playback controls, queue management, and keyboard shortcuts for a professional music streaming experience.

---

## 🎛️ Features

### 1. **Shuffle Mode**
- **Button**: Shuffle icon in player controls
- **Visual State**: 
  - Active (ON): Electric blue (#00d9ff)
  - Inactive (OFF): Gray
- **Functionality**: Randomizes the next track selection from the queue
- **Keyboard Shortcut**: None (button only)

---

### 2. **Repeat Modes**
- **Button**: Repeat icon that cycles through three modes
- **Modes**:
  - **OFF**: No repeat, queue plays once
  - **ALL**: Queue repeats infinitely
  - **ONE**: Current track repeats infinitely
- **Visual State**: 
  - OFF: Gray icon
  - ALL: Electric blue icon (circular arrows)
  - ONE: Electric blue icon with "1" indicator
- **Keyboard Shortcut**: None (button only)

---

### 3. **Queue Drawer**
- **Button**: Queue icon (music note with list)
- **Visual**: Slide-up panel from bottom-right corner
- **Features**:
  - View all tracks in queue with cover art
  - Track number, title, and artist for each item
  - Remove tracks from queue (X button on hover)
  - Empty state message when no tracks
- **Keyboard Shortcut**: None (button only)

---

### 4. **Next Up Display**
- **Location**: Below player controls, above progress bar
- **Format**: "Next up: [Track Title] - [Artist Name]"
- **Visibility**: Desktop only (hidden on mobile)
- **Functionality**: Shows the upcoming track based on current shuffle/repeat settings

---

### 5. **Keyboard Shortcuts** ⌨️
All keyboard shortcuts work globally (except when typing in input fields):

| Key | Action | Details |
|-----|--------|---------|
| **Space** | Play / Pause | Toggle playback of current track |
| **Arrow Left** | Seek -5s | Jump backward 5 seconds |
| **Arrow Right** | Seek +5s | Jump forward 5 seconds |
| **Arrow Up** | Volume Up | Increase volume by 10% (max 100%) |
| **Arrow Down** | Volume Down | Decrease volume by 10% (min 0%) |

**Note**: Keyboard shortcuts are disabled when focus is on input, textarea, or contenteditable elements.

---

## 🎨 Visual Feedback

### Active States
- **Shuffle ON**: Electric blue (#00d9ff) icon
- **Repeat ON**: Electric blue (#00d9ff) icon with mode indicator
- **Queue Open**: Electric blue (#00d9ff) icon

### Hover States
- All control buttons: Transition from gray-400 to white
- Play/Pause button: Scale effect + color shift to #00c4e6
- Queue items: Background highlights on hover
- Remove buttons: Fade in on hover, red color on hover

---

## 📱 Responsive Design

### Desktop (sm: 640px+)
- All controls visible (shuffle, previous, play/pause, next, repeat, queue)
- Next Up display visible
- Queue drawer: 384px width (w-96)
- Keyboard shortcuts fully functional

### Mobile (< 640px)
- Simplified controls: Play/Pause button only
- Previous/Next buttons hidden
- Shuffle/Repeat/Queue buttons hidden
- Next Up display hidden
- Volume control hidden (desktop only: lg+)

---

## 🔧 Technical Implementation

### Player State Management
Located in: `src/hooks/usePlayer.tsx`

```typescript
// State variables
const [shuffle, setShuffle] = useState(false)
const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
const [playHistory, setPlayHistory] = useState<Track[]>([])

// Functions
toggleShuffle()      // Toggle shuffle on/off
toggleRepeat()       // Cycle through off → all → one
getNextTrack()       // Smart next track with shuffle/repeat logic
removeFromQueue()    // Remove track from queue by index
reorderQueue()       // Future: Drag-and-drop reordering
```

### UI Components
Located in: `src/components/player/PlayerBar.tsx`

- Queue drawer with conditional rendering
- Control buttons with active state styling
- Next Up inline display
- Keyboard event listeners with input detection

---

## 🚀 Usage Examples

### Playing with Shuffle
1. Click shuffle button (turns blue)
2. Click next - plays random track from queue
3. Previous button uses play history (last 20 tracks)

### Repeat One Track
1. Click repeat button once (OFF → ALL)
2. Click repeat button again (ALL → ONE, shows "1" icon)
3. Track will replay infinitely when it ends
4. Click repeat button again (ONE → OFF)

### Managing Queue
1. Click queue button (bottom bar)
2. Drawer slides up from bottom-right
3. Hover over track to see remove button
4. Click X to remove track from queue
5. Click X (top right) or queue button to close

### Keyboard Control
1. Press **Space** to pause current track
2. Press **Arrow Right** (3x) to skip ahead 15 seconds
3. Press **Arrow Up** (2x) to increase volume by 20%
4. Press **Space** to resume playback

---

## 🐛 Known Limitations

1. Queue reordering (drag-and-drop) not yet implemented
2. Mobile keyboard shortcuts may interfere with OS controls
3. Shuffle doesn't prevent immediate repeats (true random)
4. Play history limited to last 20 tracks (memory optimization)

---

## 🎯 Future Enhancements

- [ ] Drag-and-drop queue reordering
- [ ] Save/load queue to localStorage
- [ ] Shuffle with smart anti-repeat algorithm
- [ ] Crossfade between tracks
- [ ] Equalizer controls
- [ ] Lyrics display
- [ ] Queue search/filter
- [ ] Keyboard shortcut customization

---

## 📊 Testing Checklist

- [x] Shuffle toggles on/off visually
- [x] Repeat cycles through all three modes
- [x] Queue drawer opens/closes
- [x] Next Up displays correct track
- [x] Keyboard shortcuts work globally
- [x] Input fields block keyboard shortcuts
- [x] Mobile hides advanced controls
- [x] Remove from queue works
- [x] Play history tracks previous button
- [ ] Shuffle prevents consecutive duplicates
- [ ] Queue persists on page refresh

---

**Last Updated**: January 2025  
**Version**: 1.0.0 (Phase 1 Complete)

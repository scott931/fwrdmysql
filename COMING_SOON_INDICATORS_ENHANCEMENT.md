# Coming Soon Indicators Enhancement

## Issue Description
The user requested that coming soon courses should be clearly marked so users know they cannot watch the courses yet.

## Enhanced Visual Indicators

### 1. **Center Overlay Badge** (Most Prominent)
- **Location**: Center of the course card
- **Design**: Large yellow badge with clock icon
- **Enhancements**:
  - Increased opacity (60% vs 50%)
  - Larger badge (px-6 py-3 vs px-4 py-2)
  - Bigger icon (h-8 w-8 vs h-6 w-6)
  - Bold text (text-lg vs font-semibold)
  - Added border (border-2 border-yellow-300)
  - Enhanced shadow (shadow-2xl vs shadow-lg)

```javascript
// Enhanced center overlay
<div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-60">
  <div className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-yellow-300">
    <Clock className="h-8 w-8 inline mr-3" />
    <span className="font-bold text-lg">Coming Soon</span>
  </div>
</div>
```

### 2. **Top-Right Corner Badge** (Quick Reference)
- **Location**: Top-left corner of course card
- **Design**: Small yellow badge with "SOON" text
- **Purpose**: Quick visual indicator without blocking content

```javascript
// Top-right corner badge
<div className="absolute top-3 left-3 z-20 bg-yellow-500 text-white px-3 py-1 rounded-full shadow-lg border border-yellow-300">
  <Clock className="h-4 w-4 inline mr-1" />
  <span className="text-xs font-bold">SOON</span>
</div>
```

### 3. **Bottom Status Indicator** (Detailed Info)
- **Location**: Bottom of course card
- **Design**: Highlighted background with clock icon
- **Enhancements**:
  - Background highlight (bg-yellow-500/20)
  - Larger icon (h-4 w-4 vs h-3 w-3)
  - Bold text (font-bold vs font-medium)
  - Uppercase text ("COMING SOON" vs "Coming Soon")

```javascript
// Enhanced bottom status
<div className="flex items-center space-x-2 bg-yellow-500/20 px-2 py-1 rounded">
  <Clock className="h-4 w-4 text-yellow-500" />
  <span className="text-yellow-500 text-xs font-bold">COMING SOON</span>
</div>
```

### 4. **Course Title Enhancement** (Subtle Indicator)
- **Location**: Course title text
- **Design**: Yellow tinted text with hourglass emoji
- **Purpose**: Subtle visual cue in the title

```javascript
// Enhanced course title
<h3 className={`font-bold text-base leading-tight mb-1 line-clamp-2 ${isComingSoon ? 'text-yellow-200' : 'text-white'}`}>
  {title}
  {isComingSoon && <span className="text-yellow-400 ml-1">⏳</span>}
</h3>
```

## User Experience Benefits

### ✅ **Clear Communication**
- **Multiple Visual Cues**: Users see coming soon status from multiple angles
- **No Confusion**: Impossible to miss that course is not available
- **Consistent Design**: All indicators use yellow color scheme

### ✅ **Accessibility**
- **High Contrast**: Yellow on dark background is easily readable
- **Multiple Indicators**: Redundant indicators ensure visibility
- **Clear Text**: "COMING SOON" and "SOON" are unambiguous

### ✅ **User Expectations**
- **Non-Clickable**: Cards don't navigate when clicked
- **Visual Feedback**: Users immediately understand course status
- **Professional Look**: Clean, modern design maintains platform quality

## Visual Hierarchy

### **1. Primary Indicator** (Center Overlay)
- **Purpose**: Most prominent indicator
- **Visibility**: Impossible to miss
- **Action**: Blocks interaction with course

### **2. Secondary Indicator** (Top-Right Badge)
- **Purpose**: Quick reference
- **Visibility**: Always visible
- **Action**: Provides immediate context

### **3. Tertiary Indicator** (Bottom Status)
- **Purpose**: Detailed information
- **Visibility**: Part of course info
- **Action**: Confirms status with context

### **4. Subtle Indicator** (Title Enhancement)
- **Purpose**: Reinforces status
- **Visibility**: Part of course title
- **Action**: Maintains awareness throughout viewing

## Technical Implementation

### **Conditional Rendering**
```javascript
const isComingSoon = course.comingSoon === true;
const isPlayable = course.lessons && course.lessons.length > 0 && !isComingSoon;
```

### **Click Prevention**
```javascript
// Click handler prevents navigation for coming soon courses
if (isComingSoon) {
  console.log('Course is coming soon, no navigation');
  return;
}
```

### **Visual States**
- **Coming Soon**: Yellow indicators, non-clickable, overlay present
- **Available**: Red play button, clickable, no overlay
- **No Lessons**: Coming soon indicators, non-clickable

## Summary

The enhanced coming soon indicators provide:

1. **🎯 Crystal Clear Communication** - Users immediately know course status
2. **🚫 No Confusion** - Multiple visual cues prevent misunderstanding
3. **🎨 Professional Design** - Clean, modern appearance
4. **♿ Accessibility** - High contrast, clear text, multiple indicators
5. **📱 Mobile Friendly** - All indicators work well on mobile devices

**Result**: Users can easily identify which courses are coming soon and understand they cannot watch them yet, while still being able to see what's coming up on the platform.
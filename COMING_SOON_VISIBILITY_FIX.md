# Coming Soon Courses Visibility Fix

## Issue Description
The user requested that coming soon courses should always be visible to students so they can know which courses are coming up, rather than being hidden from the frontend.

## Changes Made

### 1. **Backend API Changes** (`backend/server.js`)

#### **Courses API Endpoint**
- **Before**: `include_coming_soon = 'false'` (default)
- **After**: `include_coming_soon = 'true'` (default)

```javascript
// Old behavior - coming soon courses hidden by default
const { include_coming_soon = 'false' } = req.query;

// New behavior - coming soon courses shown by default
const { include_coming_soon = 'true' } = req.query;
```

#### **Featured Courses API Endpoint**
- **Before**: `include_coming_soon = 'false'` (default)
- **After**: `include_coming_soon = 'true'` (default)

```javascript
// Old behavior - featured coming soon courses hidden
const { include_coming_soon = 'false' } = req.query;

// New behavior - featured coming soon courses shown
const { include_coming_soon = 'true' } = req.query;
```

### 2. **Frontend API Service Changes** (`src/lib/api.ts`)

#### **Course API Methods**
- **Before**: `includeComingSoon = false` (default)
- **After**: `includeComingSoon = true` (default)

```javascript
// Old behavior
getAllCourses: (includeComingSoon = false) =>
getFeaturedCourses: (includeComingSoon = false) =>

// New behavior
getAllCourses: (includeComingSoon = true) =>
getFeaturedCourses: (includeComingSoon = true) =>
```

### 3. **Frontend Hook Changes** (`src/hooks/useDatabase.ts`)

#### **useCourses Hook**
- **Before**: `includeComingSoon = false` (default)
- **After**: `includeComingSoon = true` (default)

```javascript
// Old behavior
const fetchAllCourses = useCallback(async (includeComingSoon = false) => {

// New behavior
const fetchAllCourses = useCallback(async (includeComingSoon = true) => {
```

### 4. **Frontend Page Changes** (`src/pages/CoursesPage.tsx`)

#### **Course Filtering Logic**
- **Before**: Filtered out coming soon courses
- **After**: Shows all courses including coming soon

```javascript
// Old behavior - filtered out coming soon courses
const availableCourses = courses.filter(course => {
  if (course.lessons && course.lessons.length > 0) {
    return true;
  }
  if (!course.comingSoon) {
    return true;
  }
  return false;
});

// New behavior - shows all courses
const availableCourses = courses.filter(course => {
  return true; // Show all courses, including coming soon
});
```

## How Coming Soon Courses Are Displayed

### **Visual Indicators**
1. **Coming Soon Overlay**: Yellow badge with clock icon
2. **Non-Clickable**: Cards don't navigate when clicked
3. **Clear Labeling**: "Coming Soon" text prominently displayed

### **CourseCard Component Behavior**
```javascript
// Coming soon courses show overlay but don't navigate
const isComingSoon = course.comingSoon === true;
const isPlayable = course.lessons && course.lessons.length > 0 && !isComingSoon;

// Click handler prevents navigation for coming soon courses
if (isComingSoon) {
  console.log('Course is coming soon, no navigation');
  return;
}
```

## Benefits

### ✅ **Student Experience**
- Students can see what courses are coming up
- Builds anticipation and interest
- Helps with course planning

### ✅ **Instructor Benefits**
- Can announce upcoming courses early
- Generate interest before launch
- Test market demand

### ✅ **Platform Benefits**
- More content visible on the platform
- Better user engagement
- Clearer content roadmap

## Current State

### **Available Courses**
1. **Active Course**: "Google Project Management" (Paul Giannamore)
   - Status: Available for enrollment
   - Lessons: Available for viewing

2. **Coming Soon Course**: "Intro - Free Flutter Course 💙" (Paul Giannamore)
   - Status: Coming Soon (visible with overlay)
   - Lessons: Not yet available

### **Display Locations**
- **Home Page**: Both courses visible in appropriate sections
- **Courses Page**: Both courses listed with proper filtering
- **Category Pages**: Both courses appear in "Technology & Innovation" category
- **Featured Section**: Only featured courses (if any are marked as featured)

## Summary

The system now properly displays coming soon courses to help students:
1. **See what's coming up** - No more hidden courses
2. **Plan their learning** - Can anticipate new content
3. **Stay engaged** - More content visible on the platform

Coming soon courses are clearly marked and don't allow navigation, but they're visible everywhere to build anticipation and interest.
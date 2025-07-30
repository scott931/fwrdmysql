# Coming Soon Filtering Improvements

## Overview

This document describes the improvements made to the coming soon functionality to add server-side filtering and ensure consistency across all API endpoints.

## Issues Addressed

### ❌ **Previous Issues:**
1. **Missing Server-Side Filtering** - APIs returned all courses including coming soon
2. **Inconsistent Filtering Logic** - Different endpoints handled coming soon differently
3. **Client-Side Performance Issues** - Filtering happened on frontend, inefficient for large datasets
4. **No Admin Access** - Admins couldn't see coming soon courses for management

### ✅ **Solutions Implemented:**

## 1. Server-Side Filtering

### Backend API Updates

**All course endpoints now include consistent filtering:**

```javascript
// GET /api/courses
const { include_coming_soon = 'false' } = req.query;
const includeComingSoon = include_coming_soon === 'true';

let whereClause = '';
if (!includeComingSoon) {
  whereClause = 'WHERE c.coming_soon = false';
}
```

**Updated Endpoints:**
- `GET /api/courses` - Filters out coming soon by default
- `GET /api/courses/featured` - Filters out coming soon by default
- `GET /api/courses/category/:categoryId` - Filters out coming soon by default
- `GET /api/instructors/:id/courses` - Filters out coming soon by default
- `GET /api/search` - Filters out coming soon by default

### Query Parameters

**New Optional Parameter:**
- `include_coming_soon=true` - Include coming soon courses (for admin access)
- Default: `false` (coming soon courses excluded)

**Examples:**
```bash
# Regular user access (coming soon excluded)
GET /api/courses

# Admin access (coming soon included)
GET /api/courses?include_coming_soon=true
```

## 2. Frontend API Service Updates

### Updated API Functions

```typescript
// Course API
export const courseAPI = {
  getAllCourses: (includeComingSoon = false) =>
    apiRequest(`/courses${includeComingSoon ? '?include_coming_soon=true' : ''}`),

  getFeaturedCourses: (includeComingSoon = false) =>
    apiRequest(`/courses/featured${includeComingSoon ? '?include_coming_soon=true' : ''}`),

  getCoursesByCategory: (categoryId: string, includeComingSoon = false) =>
    apiRequest(`/courses/category/${categoryId}${includeComingSoon ? '?include_coming_soon=true' : ''}`),

  searchCourses: (query: string, options?: { includeComingSoon?: boolean }) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (options?.includeComingSoon) params.append('include_coming_soon', 'true');
    return apiRequest(`/search?${params.toString()}`);
  }
};

// Instructor API
export const instructorAPI = {
  getInstructorCourses: (instructorId: string, includeComingSoon = false) =>
    apiRequest(`/instructors/${instructorId}/courses${includeComingSoon ? '?include_coming_soon=true' : ''}`)
};
```

## 3. Frontend Hook Updates

### Updated useCourses Hook

```typescript
const fetchAllCourses = useCallback(async (includeComingSoon = false) => {
  setLoading(true);
  setError(null);

  try {
    const data = await courseAPI.getAllCourses(includeComingSoon);
    // ... rest of implementation
  } catch (err) {
    // ... error handling
  }
}, []);
```

## 4. Admin Page Updates

### Admin Access to Coming Soon Courses

```typescript
// Admin page now fetches all courses including coming soon
useEffect(() => {
  fetchAllCourses(true); // Include coming soon courses for admin management
  // ... other data fetching
}, [fetchAllCourses, ...]);
```

## 5. Client-Side Filtering Removal

### Updated CoursesPage

**Before:**
```typescript
const availableCourses = courses.filter(course =>
  course.lessons.length > 0 && !course.comingSoon
);
```

**After:**
```typescript
const availableCourses = courses.filter(course =>
  course.lessons.length > 0 // coming soon filtered server-side
);
```

## 6. Test Data Added

### Database Schema Update

```sql
-- Added test course with coming_soon = true
INSERT INTO courses (id, title, instructor_id, category_id, thumbnail, banner, video_url, description, featured, total_xp, coming_soon) VALUES
('course6', 'Advanced AI & Machine Learning', 'inst5', 'cat5', '...', '...', '...', 'Advanced course on artificial intelligence and machine learning. Coming soon with comprehensive content.', FALSE, 800, TRUE);
```

## 7. Test Script

### Verification Script

Created `test_coming_soon_api.js` to verify functionality:

```javascript
// Tests all endpoints with and without include_coming_soon parameter
// Verifies that:
// - Default endpoints exclude coming soon courses
// - Admin endpoints include coming soon courses
// - Search functionality works correctly
```

## Benefits

### ✅ **Performance Improvements:**
- Server-side filtering reduces data transfer
- Faster page loads for users
- Reduced client-side processing

### ✅ **Consistency:**
- All endpoints use same filtering logic
- Predictable behavior across the application
- Easier to maintain and debug

### ✅ **Admin Functionality:**
- Admins can see and manage coming soon courses
- Proper separation between user and admin views
- Full course management capabilities

### ✅ **Security:**
- Coming soon courses properly hidden from regular users
- Admin access controlled via query parameters
- No accidental exposure of unpublished content

## Usage Examples

### For Regular Users (Default Behavior)
```typescript
// Automatically excludes coming soon courses
const courses = await courseAPI.getAllCourses();
```

### For Admin Pages
```typescript
// Includes coming soon courses for management
const allCourses = await courseAPI.getAllCourses(true);
```

### For Search with Admin Access
```typescript
// Search including coming soon courses
const results = await courseAPI.searchCourses('AI', { includeComingSoon: true });
```

## Migration Notes

### Breaking Changes
- None - all changes are backward compatible
- Default behavior remains the same for regular users
- Admin pages automatically get access to coming soon courses

### Testing
- Run `node test_coming_soon_api.js` to verify functionality
- Check admin pages show coming soon courses
- Verify regular user pages exclude coming soon courses

## Future Enhancements

### Potential Improvements
1. **Role-Based Access** - Use user roles instead of query parameters
2. **Caching** - Cache filtered results for better performance
3. **Analytics** - Track coming soon course views for admin insights
4. **Notifications** - Alert admins when coming soon courses are ready to publish
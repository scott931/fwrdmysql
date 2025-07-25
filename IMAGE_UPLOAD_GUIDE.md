# Image Upload Functionality Guide

## Overview

The Forward Africa Learning Platform now supports direct image uploads for various content types, eliminating the need for external image URLs. Users can upload profile pictures, course thumbnails, course banners, lesson thumbnails, and certificates directly within the application.

## Features

### ✅ Supported Upload Types
- **Profile Images** (Avatars)
- **Course Thumbnails**
- **Course Banners**
- **Lesson Thumbnails**
- **Certificates**

### ✅ File Validation
- **File Type**: Only image files (JPG, PNG, GIF, WebP)
- **File Size**: Maximum 5MB per file
- **Real-time Preview**: Instant image preview before upload
- **Error Handling**: Clear error messages for invalid files

### ✅ User Experience
- **Drag & Drop**: Click to select files
- **Progress Indicator**: Upload progress with loading states
- **Remove Option**: Easy image removal with X button
- **Responsive Design**: Works on all screen sizes

## Backend Implementation

### File Storage Structure
```
backend/uploads/
├── avatars/           # User profile pictures
├── course-media/      # Course thumbnails, banners, lesson images
└── certificates/      # Generated certificates
```

### API Endpoints
- `POST /api/upload/avatar` - Profile image upload
- `POST /api/upload/course-thumbnail` - Course thumbnail upload
- `POST /api/upload/course-banner` - Course banner upload
- `POST /api/upload/lesson-thumbnail` - Lesson thumbnail upload
- `POST /api/upload/certificate` - Certificate upload

### Security Features
- **File Type Validation**: Only image files allowed
- **Size Limits**: 5MB maximum file size
- **Unique Filenames**: Timestamp-based naming to prevent conflicts
- **Organized Storage**: Separate directories for different content types

## Frontend Implementation

### ImageUpload Component

The `ImageUpload` component is a reusable React component that handles all image upload functionality.

#### Props
```typescript
interface ImageUploadProps {
  onImageUpload: (url: string) => void;    // Callback when upload completes
  currentImage?: string;                   // Current image URL (for editing)
  uploadType: 'avatar' | 'courseThumbnail' | 'courseBanner' | 'lessonThumbnail' | 'certificate';
  label?: string;                          // Form label
  className?: string;                      // Additional CSS classes
  previewSize?: 'sm' | 'md' | 'lg';       // Preview image size
  required?: boolean;                      // Whether field is required
}
```

#### Usage Examples

**Profile Image Upload:**
```tsx
<ImageUpload
  onImageUpload={(url) => setProfileImage(url)}
  currentImage={user.avatar_url}
  uploadType="avatar"
  label="Profile Image"
  previewSize="md"
/>
```

**Course Thumbnail Upload:**
```tsx
<ImageUpload
  onImageUpload={setThumbnail}
  currentImage={course.thumbnail}
  uploadType="courseThumbnail"
  label="Course Thumbnail"
  previewSize="sm"
  required
/>
```

## Updated Pages

### 1. Profile Page (`/profile`)
- **Before**: URL input field for avatar
- **After**: Direct image upload with preview

### 2. Upload Course Page (`/admin/upload-course`)
- **Before**: URL inputs for thumbnail and banner
- **After**: Direct upload for both course images
- **Lesson Images**: Each lesson now has direct thumbnail upload

### 3. Add Facilitator Page (`/admin/add-facilitator`)
- **Before**: URL input for profile image
- **After**: Direct image upload with preview

## Technical Details

### Backend Dependencies
- **multer**: File upload middleware
- **path**: File path handling
- **fs**: File system operations

### Frontend Dependencies
- **FileReader API**: Client-side image preview
- **FormData**: File upload to server
- **Fetch API**: HTTP requests

### File Processing
1. **Client-side Validation**: File type and size checked before upload
2. **Preview Generation**: FileReader creates data URL for preview
3. **Server Upload**: FormData sent to backend endpoint
4. **File Storage**: Files saved with unique names in organized directories
5. **URL Return**: Server returns public URL for the uploaded file

## Error Handling

### Common Error Scenarios
- **Invalid File Type**: Only image files accepted
- **File Too Large**: Maximum 5MB limit
- **Upload Failure**: Network or server errors
- **Missing File**: No file selected

### Error Messages
- Clear, user-friendly error messages
- Specific guidance for resolution
- Automatic error clearing on retry

## Performance Considerations

### Optimization Features
- **File Size Limits**: Prevents large file uploads
- **Image Preview**: Client-side preview reduces server load
- **Unique Naming**: Prevents filename conflicts
- **Organized Storage**: Efficient file organization

### Future Enhancements
- **Image Compression**: Automatic image optimization
- **Multiple Formats**: Support for more image formats
- **CDN Integration**: Faster image delivery
- **Image Cropping**: Built-in image editing tools

## Security Considerations

### Current Security Measures
- **File Type Validation**: Prevents malicious file uploads
- **Size Limits**: Prevents DoS attacks
- **Unique Filenames**: Prevents file overwrites
- **Organized Storage**: Isolates different content types

### Recommended Enhancements
- **Virus Scanning**: Scan uploaded files for malware
- **Image Processing**: Sanitize uploaded images
- **Access Control**: Implement proper file access permissions
- **Backup Strategy**: Regular backup of uploaded files

## Testing

### Manual Testing Checklist
- [ ] Upload valid image files (JPG, PNG, GIF)
- [ ] Test file size limits (try files > 5MB)
- [ ] Test invalid file types (try non-image files)
- [ ] Verify image preview functionality
- [ ] Test image removal functionality
- [ ] Verify upload progress indicators
- [ ] Test error message display
- [ ] Verify responsive design on mobile

### Automated Testing
- Unit tests for ImageUpload component
- Integration tests for upload endpoints
- E2E tests for complete upload flow

## Troubleshooting

### Common Issues

**Upload Fails with "Network Error"**
- Check if backend server is running on port 3002
- Verify API_BASE_URL configuration
- Check browser console for CORS errors

**Images Not Displaying**
- Verify file permissions on upload directories
- Check if static file serving is configured
- Verify image URLs are accessible

**Large Files Not Uploading**
- Check file size limits (5MB maximum)
- Verify multer configuration
- Check server memory limits

## Migration Guide

### From URL-based to Upload-based

1. **Backup Existing Data**: Export current image URLs
2. **Update Forms**: Replace URL inputs with ImageUpload components
3. **Test Functionality**: Verify uploads work correctly
4. **Migrate Existing Images**: Optionally migrate existing URLs to uploaded files
5. **Update Documentation**: Update user guides and help content

### Database Considerations
- Image URLs are stored as strings in the database
- No database schema changes required
- Existing URL-based images continue to work
- Gradual migration possible

## Conclusion

The new image upload functionality provides a much better user experience by eliminating the need for external image hosting. Users can now upload images directly within the application, with proper validation, preview, and error handling.

The implementation is secure, performant, and scalable, with clear separation of concerns between frontend and backend components. The reusable ImageUpload component makes it easy to add upload functionality to any part of the application.
# Homepage Banner Management System

## Overview

The Homepage Banner Management System allows super administrators to customize the main banner displayed on the homepage. This system provides three banner types:

1. **Course Banner** (Default) - Shows the featured course banner
2. **Custom Image** - Upload and display a custom image banner
3. **Custom Video** - Upload and display a custom video banner

## Features

### ✅ Implemented Features

- **Banner Type Selection**: Choose between course, image, or video banners
- **File Upload**: Support for images (JPEG, PNG, WebP) and videos (MP4, WebM, OGG)
- **Custom Content**: Set custom title, subtitle, description, and button text
- **Overlay Control**: Adjust overlay opacity for better text readability
- **Preview System**: Real-time preview of banner configuration
- **Admin Interface**: Integrated into System Configuration page
- **Database Storage**: Persistent configuration storage
- **Audit Logging**: All banner changes are logged for security

### 🔧 Technical Implementation

#### Database Schema
```sql
-- Banner configuration fields added to system_configuration table
homepage_banner_enabled BOOLEAN DEFAULT FALSE
homepage_banner_type ENUM('video', 'image', 'course') DEFAULT 'course'
homepage_banner_video_url VARCHAR(500)
homepage_banner_image_url VARCHAR(500)
homepage_banner_title VARCHAR(255)
homepage_banner_subtitle TEXT
homepage_banner_description TEXT
homepage_banner_button_text VARCHAR(100) DEFAULT 'Get Started'
homepage_banner_button_url VARCHAR(500)
homepage_banner_overlay_opacity DECIMAL(3,2) DEFAULT 0.70
```

#### API Endpoints
- `GET /api/banner/config` - Fetch banner configuration
- `PUT /api/banner/config` - Update banner configuration (Super Admin only)
- `POST /api/banner/upload` - Upload banner files (Super Admin only)

#### File Storage
- Banner files are stored in `backend/uploads/banners/`
- Automatic directory creation on first upload
- Unique filename generation with timestamps
- File type and size validation

## Usage Guide

### For Super Administrators

#### 1. Access Banner Management
1. Log in as a super administrator
2. Navigate to **Admin Dashboard** → **System Configuration**
3. Click on the **"Banner"** tab

#### 2. Configure Banner Settings

**Step 1: Choose Banner Type**
- **Course Banner**: Shows featured course (default behavior)
- **Custom Image**: Upload and display custom image
- **Custom Video**: Upload and display custom video

**Step 2: Enable Custom Banner**
- Toggle "Enable Custom Banner" to activate custom banner mode
- When disabled, the system falls back to course banner

**Step 3: Upload Media (if using custom banner)**
- Click the upload area to select a file
- Supported formats:
  - Images: JPEG, PNG, WebP (max 100MB)
- Videos: MP4, WebM, OGG (max 100MB)
- Files are automatically processed and stored

**Step 4: Configure Content**
- **Banner Title**: Main headline text
- **Banner Subtitle**: Secondary text (appears in red)
- **Banner Description**: Detailed description text
- **Button Text**: Call-to-action button text
- **Button URL**: Link for the button (optional)

**Step 5: Adjust Overlay**
- Use the opacity slider to control overlay darkness
- Higher opacity = darker overlay = better text readability
- Lower opacity = lighter overlay = more visible background

**Step 6: Preview and Save**
- Use the preview panel to see how the banner will look
- Click "Save Configuration" to apply changes
- Changes take effect immediately on the homepage

### For Developers

#### Integration Points

**1. HeroBanner Component**
```typescript
// The HeroBanner component automatically checks for custom banner configuration
// and falls back to course banner if custom banner is disabled

const shouldUseCustomBanner = bannerConfig?.homepage_banner_enabled &&
                              bannerConfig?.homepage_banner_type !== 'course';
```

**2. Banner Configuration Loading**
```typescript
// Banner configuration is loaded on component mount
useEffect(() => {
  const loadBannerConfig = async () => {
    const response = await fetch('/api/banner/config');
    const config = await response.json();
    setBannerConfig(config);
  };
  loadBannerConfig();
}, []);
```

**3. File Upload Handling**
```typescript
// File upload with progress and validation
const handleFileUpload = async (event) => {
  const formData = new FormData();
  formData.append('banner', file);

  const response = await fetch('/api/banner/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
};
```

#### Database Migration

To add banner configuration to existing databases:

```sql
-- Run the add_banner_config.sql script
-- This adds all necessary columns to the system_configuration table
```

#### File Structure
```
backend/
├── uploads/
│   └── banners/          # Banner file storage
├── server.js             # Banner API endpoints
└── routes/
    └── secureRoutes.js   # Banner configuration endpoints

src/
├── components/ui/
│   ├── HeroBanner.tsx    # Updated banner component
│   └── BannerManagement.tsx  # Admin interface
└── pages/
    └── SystemConfigurationPage.tsx  # Integrated banner management
```

## Security Considerations

### Access Control
- Only super administrators can modify banner configuration
- File uploads require authentication and authorization
- All changes are logged in audit logs

### File Validation
- File type validation (images: JPEG, PNG, WebP; videos: MP4, WebM, OGG)
- File size limits (100MB maximum)
- Secure file naming with timestamps and random IDs

### Data Protection
- Banner configuration is stored securely in database
- File URLs are generated with proper security headers
- No direct file system access from frontend

## Troubleshooting

### Common Issues

**1. Banner not displaying**
- Check if banner is enabled in configuration
- Verify file upload was successful
- Check browser console for errors

**2. File upload fails**
- Ensure file type is supported
- Check file size (max 100MB)
- Verify super admin permissions

**3. Banner configuration not saving**
- Check authentication token
- Verify super admin role
- Check database connection

**4. Preview not updating**
- Refresh the page
- Clear browser cache
- Check network connectivity

### Debug Steps

1. **Check API Response**
```bash
curl -X GET http://localhost:3002/api/banner/config
```

2. **Verify File Upload**
```bash
# Check if banner directory exists
ls -la backend/uploads/banners/
```

3. **Check Database**
```sql
SELECT * FROM system_configuration WHERE id = 1;
```

4. **Review Audit Logs**
```sql
SELECT * FROM audit_logs WHERE action = 'BANNER_CONFIG_UPDATE' ORDER BY created_at DESC;
```

## Future Enhancements

### Planned Features
- **A/B Testing**: Test different banner configurations
- **Scheduling**: Set banner display schedules
- **Analytics**: Track banner performance metrics
- **Templates**: Pre-built banner templates
- **Mobile Optimization**: Responsive banner configurations

### Technical Improvements
- **CDN Integration**: Serve banner files from CDN
- **Image Optimization**: Automatic image compression
- **Video Transcoding**: Automatic video format conversion
- **Caching**: Banner configuration caching
- **Webhooks**: Notify external systems of banner changes

## Support

For technical support or feature requests:
1. Check the troubleshooting section above
2. Review the audit logs for error details
3. Contact the development team with specific error messages
4. Provide screenshots or video recordings of issues

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Compatibility**: Forward Africa Platform v2.0+
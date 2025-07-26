# Video Content Management System Implementation Guide

## Overview

This implementation provides a comprehensive video content management system for the Forward Africa Learning Platform with the following key features:

1. **Automated Video Transcoding** - Multiple resolution outputs (1080p, 720p, 480p)
2. **Automatic Subtitle Generation** - Speech-to-text with confidence scoring
3. **Content Workflow Management** - Draft, review, approved, published states
4. **Advanced Metadata Management** - Flexible metadata and tagging system
5. **Background Job Processing** - Queue-based processing with Redis
6. **Real-time Status Monitoring** - Live progress tracking and error handling

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Background    │
│   Components    │◄──►│   Server        │◄──►│   Job Queues    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   MySQL         │    │   Redis         │
                       │   Database      │    │   Queue         │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   FFmpeg        │
                       │   Processing    │
                       └─────────────────┘
```

## Database Schema

### Core Tables

1. **video_assets** - Main video file information
2. **video_transcodings** - Different resolution versions
3. **subtitles** - Generated subtitle files
4. **subtitle_segments** - Individual subtitle segments
5. **content_workflow** - Workflow state management
6. **workflow_history** - Workflow change tracking
7. **content_metadata** - Flexible metadata storage
8. **content_tags** - Advanced tagging system
9. **processing_jobs** - Background job tracking
10. **video_analytics** - Video performance metrics

## Installation & Setup

### 1. Database Setup

```sql
-- Run the video content management schema
mysql -u your_username -p forward_africa_db < video_content_management_schema.sql
```

### 2. Backend Dependencies

```bash
cd backend
npm install fluent-ffmpeg aws-sdk google-cloud-speech google-cloud-storage bull redis sharp exif-parser mediainfo node-cron formidable
```

### 3. System Requirements

- **FFmpeg**: Install FFmpeg for video processing
- **Redis**: Install Redis for job queues
- **Node.js**: Version 16+ required

### 4. Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=forward_africa_user
DB_PASSWORD=your_password
DB_NAME=forward_africa_db
DB_PORT=3306

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Google Cloud (for speech-to-text)
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# AWS (optional, for cloud storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

## API Endpoints

### Video Upload & Processing

```http
POST /api/video-content/upload/:lessonId
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- video: File (required)
- title: string
- description: string
- tags: JSON string
- metadata: JSON string
```

### Processing Status

```http
GET /api/video-content/status/:videoAssetId
Authorization: Bearer <token>
```

### Video Qualities

```http
GET /api/video-content/qualities/:videoAssetId
Authorization: Bearer <token>
```

### Subtitles

```http
GET /api/video-content/subtitles/:videoAssetId?language=en&format=srt
Authorization: Bearer <token>
```

### Workflow Management

```http
GET /api/video-content/workflow/:contentType/:contentId
PUT /api/video-content/workflow/:workflowId/status
POST /api/video-content/workflow/:workflowId/assign-reviewer
POST /api/video-content/workflow/:workflowId/review-notes
```

### Metadata Management

```http
POST /api/video-content/metadata/:contentType/:contentId
PUT /api/video-content/metadata/:metadataId
GET /api/video-content/metadata/:contentType/:contentId
```

### Job Management

```http
GET /api/video-content/jobs/:jobId
GET /api/video-content/jobs/content/:contentId
POST /api/video-content/jobs/:jobId/retry
GET /api/video-content/jobs/queue/stats
```

## Frontend Components

### VideoUpload Component

```tsx
import { VideoUpload } from '../components/VideoUpload';

<VideoUpload
  lessonId="lesson-123"
  onUploadComplete={(videoAssetId) => {
    console.log('Video uploaded:', videoAssetId);
  }}
/>
```

### VideoProcessingStatus Component

```tsx
import { VideoProcessingStatus } from '../components/VideoProcessingStatus';

<VideoProcessingStatus videoAssetId="video-asset-123" />
```

## Usage Examples

### 1. Upload a Video

```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('title', 'Introduction to Business');
formData.append('description', 'Learn the fundamentals of business');
formData.append('tags', JSON.stringify(['business', 'fundamentals']));
formData.append('metadata', JSON.stringify({
  difficulty: 'beginner',
  duration: '15 minutes',
  language: 'english'
}));

const response = await fetch('/api/video-content/upload/lesson-123', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Video Asset ID:', result.videoAssetId);
```

### 2. Monitor Processing Status

```javascript
const checkStatus = async (videoAssetId) => {
  const response = await fetch(`/api/video-content/status/${videoAssetId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const status = await response.json();

  // Check if all jobs are completed
  const allCompleted = status.jobs.every(job => job.status === 'completed');

  if (allCompleted) {
    console.log('Video processing completed!');
  }
};
```

### 3. Update Workflow Status

```javascript
const updateWorkflow = async (workflowId, newStatus) => {
  const response = await fetch(`/api/video-content/workflow/${workflowId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: newStatus,
      notes: 'Ready for review'
    })
  });

  const result = await response.json();
  console.log('Workflow updated:', result);
};
```

### 4. Add Metadata

```javascript
const addMetadata = async (contentId, contentType, metadata) => {
  const response = await fetch(`/api/video-content/metadata/${contentType}/${contentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      metadata: {
        key: 'target_audience',
        value: 'beginner',
        type: 'string',
        isPublic: true,
        isSearchable: true
      }
    })
  });

  const result = await response.json();
  console.log('Metadata added:', result.metadataId);
};
```

## Processing Pipeline

### 1. Video Upload Flow

```
1. User uploads video file
2. File saved to uploads/videos/
3. Video asset record created
4. Background jobs queued:
   - Metadata extraction (priority 1)
   - Thumbnail generation (priority 2)
   - Video transcoding (priority 3)
   - Subtitle generation (priority 4)
5. Workflow created with 'draft' status
```

### 2. Transcoding Process

```
1. FFmpeg processes original video
2. Creates multiple resolutions:
   - 1920x1080 (high quality)
   - 1280x720 (medium quality)
   - 854x480 (low quality)
3. Each resolution saved as MP4
4. Progress tracked in database
5. Completion status updated
```

### 3. Subtitle Generation

```
1. Audio extracted from video
2. Converted to 16kHz mono WAV
3. Sent to speech recognition service
4. Subtitles generated with timestamps
5. Saved as SRT file
6. Segments stored in database
```

### 4. Workflow States

```
Draft → Review → Approved → Published
   ↓        ↓         ↓
Archived ←───────←───────←
```

## Configuration Options

### Video Transcoding Settings

```javascript
// In videoProcessingService.js
const resolutions = [
  { resolution: '1920x1080', quality: 'high', bitrate: 5000 },
  { resolution: '1280x720', quality: 'medium', bitrate: 2500 },
  { resolution: '854x480', quality: 'low', bitrate: 1000 }
];
```

### Job Queue Settings

```javascript
// In jobProcessorService.js
const queueConfig = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  },
  removeOnComplete: 100,
  removeOnFail: 50
};
```

### Speech Recognition Settings

```javascript
// Configure Google Speech-to-Text
const speechConfig = {
  languageCode: 'en-US',
  enableAutomaticPunctuation: true,
  enableWordTimeOffsets: true,
  model: 'latest_long'
};
```

## Monitoring & Analytics

### Queue Statistics

```javascript
const stats = await jobProcessorService.getQueueStatistics();
console.log('Queue stats:', stats);
// Output:
// {
//   'video-transcoding': { waiting: 5, active: 2, completed: 150, failed: 3 },
//   'subtitle-generation': { waiting: 2, active: 1, completed: 120, failed: 1 }
// }
```

### Workflow Analytics

```javascript
const workflowStats = await contentWorkflowService.getWorkflowStatistics();
console.log('Workflow stats:', workflowStats);
// Output:
// [
//   { status: 'draft', content_type: 'lesson', count: 25 },
//   { status: 'review', content_type: 'lesson', count: 10 },
//   { status: 'published', content_type: 'lesson', count: 150 }
// ]
```

## Error Handling

### Common Issues & Solutions

1. **FFmpeg not found**
   ```bash
   # Install FFmpeg
   sudo apt-get install ffmpeg  # Ubuntu/Debian
   brew install ffmpeg          # macOS
   ```

2. **Redis connection failed**
   ```bash
   # Start Redis server
   redis-server
   ```

3. **Video processing fails**
   - Check file format compatibility
   - Verify FFmpeg installation
   - Check disk space
   - Review error logs

4. **Subtitle generation fails**
   - Verify Google Cloud credentials
   - Check audio quality
   - Ensure language support

## Performance Optimization

### 1. Queue Management

- Use priority queues for critical jobs
- Implement job batching for bulk operations
- Monitor queue lengths and processing times

### 2. Storage Optimization

- Implement video cleanup for failed uploads
- Use cloud storage for processed videos
- Compress thumbnails and metadata

### 3. Database Optimization

- Index frequently queried fields
- Use connection pooling
- Implement query caching

## Security Considerations

### 1. File Upload Security

- Validate file types and sizes
- Scan for malware
- Use secure file storage

### 2. API Security

- Implement rate limiting
- Use JWT authentication
- Validate all inputs

### 3. Data Protection

- Encrypt sensitive metadata
- Implement access controls
- Audit all operations

## Deployment

### Production Checklist

- [ ] Install FFmpeg on server
- [ ] Configure Redis for production
- [ ] Set up Google Cloud credentials
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Implement backup strategies
- [ ] Configure SSL certificates
- [ ] Set up load balancing

### Docker Deployment

```dockerfile
FROM node:16-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Expose port
EXPOSE 3002

# Start application
CMD ["npm", "start"]
```

## Testing

### Unit Tests

```javascript
// Test video processing service
describe('VideoProcessingService', () => {
  test('should extract video metadata', async () => {
    const metadata = await videoProcessingService.extractVideoMetadata('test.mp4');
    expect(metadata).toHaveProperty('duration');
    expect(metadata).toHaveProperty('resolution');
  });
});
```

### Integration Tests

```javascript
// Test complete upload flow
describe('Video Upload Flow', () => {
  test('should process video upload end-to-end', async () => {
    // Upload video
    const uploadResult = await uploadVideo(testFile);

    // Check processing status
    const status = await getProcessingStatus(uploadResult.videoAssetId);

    // Verify all jobs completed
    expect(status.jobs.every(job => job.status === 'completed')).toBe(true);
  });
});
```

## Troubleshooting

### Debug Mode

Enable debug logging:

```javascript
// Set environment variable
DEBUG=video-processing,workflow,jobs

// Or in code
console.log('Processing job:', jobId, 'Status:', status);
```

### Common Log Locations

- Application logs: `logs/app.log`
- FFmpeg logs: `logs/ffmpeg.log`
- Queue logs: `logs/queue.log`

### Health Checks

```javascript
// Check system health
const health = await Promise.all([
  database.healthCheck(),
  redis.ping(),
  ffmpeg.checkAvailability()
]);
```

## Future Enhancements

1. **AI-powered content analysis**
2. **Multi-language subtitle support**
3. **Advanced video analytics**
4. **Cloud-based processing**
5. **Real-time collaboration features**
6. **Advanced workflow automation**
7. **Content recommendation engine**
8. **Mobile app integration**

## Support

For technical support and questions:

1. Check the troubleshooting section
2. Review error logs
3. Consult the API documentation
4. Contact the development team

---

This implementation provides a robust, scalable video content management system that can handle the growing needs of the Forward Africa Learning Platform.
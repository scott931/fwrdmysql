const videoCompressionService = require('./backend/services/videoCompressionService');
const path = require('path');

async function testVideoCompression() {
  try {
    console.log('🧪 Testing Video Compression Service...');

    // Test with a sample video (you'll need to provide a test video)
    const testVideoPath = path.join(__dirname, 'test-video.mp4');

    // Check if test video exists
    const fs = require('fs');
    if (!fs.existsSync(testVideoPath)) {
      console.log('⚠️ Test video not found. Please add a test video file named "test-video.mp4" to test compression.');
      console.log('📝 You can use any MP4 video file for testing.');
      return;
    }

    console.log('📹 Testing video compression...');

    // Test compression
    const result = await videoCompressionService.processVideoUpload(
      testVideoPath,
      path.join(__dirname, 'backend', 'uploads', 'banners'),
      {
        quality: 'medium',
        maxSizeMB: 50,
        format: 'mp4'
      }
    );

    console.log('✅ Video compression test completed!');
    console.log('📊 Results:', {
      originalSize: `${(result.compressionResult?.originalSize / (1024 * 1024)).toFixed(1)}MB`,
      compressedSize: `${(result.compressionResult?.compressedSize / (1024 * 1024)).toFixed(1)}MB`,
      compressionRatio: `${result.compressionResult?.compressionRatio}%`,
      thumbnailGenerated: !!result.thumbnailPath
    });

  } catch (error) {
    console.error('❌ Video compression test failed:', error.message);
  }
}

testVideoCompression();
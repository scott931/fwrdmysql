/**
 * Test YouTube Video URLs
 *
 * This script tests the YouTube video URLs used in the application
 * to ensure they are valid and accessible.
 */

const https = require('https');
const { URL } = require('url');

// Test YouTube video URLs from the application
const testVideos = [
  {
    name: 'Business Fundamentals',
    url: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
    expectedId: '8jPQjjsBbIc'
  },
  {
    name: 'Innovation & Technology',
    url: 'https://www.youtube.com/watch?v=cdiD-9MMpb0',
    expectedId: 'cdiD-9MMpb0'
  },
  {
    name: 'Strategic Decision Making',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    expectedId: '9bZkp7q19f0'
  },
  {
    name: 'Building Teams',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    expectedId: 'kJQP7kiw5Fk'
  },
  {
    name: 'Financial Management',
    url: 'https://www.youtube.com/watch?v=L_jWHffIx5E',
    expectedId: 'L_jWHffIx5E'
  },
  {
    name: 'Scaling Business',
    url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    expectedId: 'fJ9rUzIMcZQ'
  }
];

// Function to extract YouTube video ID
function extractYouTubeId(url) {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})&?.*$/,
    /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Function to test if a YouTube video is accessible
function testYouTubeVideo(video) {
  return new Promise((resolve) => {
    const videoId = extractYouTubeId(video.url);

    if (!videoId) {
      resolve({
        name: video.name,
        url: video.url,
        status: 'ERROR',
        message: 'Could not extract video ID'
      });
      return;
    }

    if (videoId !== video.expectedId) {
      resolve({
        name: video.name,
        url: video.url,
        status: 'ERROR',
        message: `Video ID mismatch: expected ${video.expectedId}, got ${videoId}`
      });
      return;
    }

    // Test the embed URL
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    const req = https.get(embedUrl, (res) => {
      if (res.statusCode === 200) {
        resolve({
          name: video.name,
          url: video.url,
          videoId: videoId,
          embedUrl: embedUrl,
          status: 'SUCCESS',
          message: 'Video is accessible'
        });
      } else {
        resolve({
          name: video.name,
          url: video.url,
          videoId: videoId,
          embedUrl: embedUrl,
          status: 'ERROR',
          message: `HTTP ${res.statusCode}: ${res.statusMessage}`
        });
      }
    });

    req.on('error', (error) => {
      resolve({
        name: video.name,
        url: video.url,
        videoId: videoId,
        embedUrl: embedUrl,
        status: 'ERROR',
        message: `Network error: ${error.message}`
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name: video.name,
        url: video.url,
        videoId: videoId,
        embedUrl: embedUrl,
        status: 'ERROR',
        message: 'Request timeout'
      });
    });
  });
}

// Main test function
async function runTests() {
  console.log('🧪 Testing YouTube Video URLs...\n');

  const results = [];

  for (const video of testVideos) {
    console.log(`Testing: ${video.name}`);
    const result = await testYouTubeVideo(video);
    results.push(result);

    if (result.status === 'SUCCESS') {
      console.log(`✅ ${result.message}`);
    } else {
      console.log(`❌ ${result.message}`);
    }
    console.log(`   Video ID: ${result.videoId || 'N/A'}`);
    console.log(`   Embed URL: ${result.embedUrl || 'N/A'}`);
    console.log('');
  }

  // Summary
  console.log('📊 Test Summary:');
  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const errorCount = results.filter(r => r.status === 'ERROR').length;

  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📈 Success Rate: ${((successCount / results.length) * 100).toFixed(1)}%`);

  if (errorCount > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'ERROR').forEach(result => {
      console.log(`   - ${result.name}: ${result.message}`);
    });
  }

  console.log('\n🎯 Recommendations:');
  if (successCount === results.length) {
    console.log('   All videos are working correctly!');
  } else {
    console.log('   - Check if any videos are private or restricted');
    console.log('   - Verify that embedding is enabled for all videos');
    console.log('   - Consider using alternative video URLs if needed');
    console.log('   - Test videos in different regions if applicable');
  }
}

// Run the tests
runTests().catch(console.error);
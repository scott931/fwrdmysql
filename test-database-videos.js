/**
 * Test Database Video URLs
 *
 * This script tests the YouTube video URLs currently in the database
 * to see which ones are valid and accessible.
 */

const https = require('https');

// YouTube URLs found in the database
const databaseVideos = [
  {
    name: 'Course Video 1',
    url: 'https://youtu.be/amtBUvkweEA',
    expectedId: 'amtBUvkweEA'
  },
  {
    name: 'Course Video 2',
    url: 'https://youtu.be/eHJnEHyyN1Y',
    expectedId: 'eHJnEHyyN1Y'
  },
  {
    name: 'Invalid URL 1',
    url: 'http://localhost:3000/admin/upload-course',
    expectedId: null
  },
  {
    name: 'Empty URL',
    url: '',
    expectedId: null
  }
];

// Function to extract YouTube ID
function extractYouTubeId(url) {
  if (!url) return null;

  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Function to test YouTube video accessibility
function testYouTubeVideo(videoId) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.youtube.com',
      port: 443,
      path: `/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.title) {
            resolve({ valid: true, title: response.title });
          } else {
            resolve({ valid: false, error: 'No title found' });
          }
        } catch (error) {
          resolve({ valid: false, error: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ valid: false, error: error.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ valid: false, error: 'Request timeout' });
    });

    req.end();
  });
}

// Test all videos
async function testAllVideos() {
  console.log('🔍 Testing Database Video URLs...\n');

  for (const video of databaseVideos) {
    console.log(`📹 Testing: ${video.name}`);
    console.log(`   URL: ${video.url}`);

    const extractedId = extractYouTubeId(video.url);
    console.log(`   Extracted ID: ${extractedId || 'None'}`);

    if (extractedId) {
      const result = await testYouTubeVideo(extractedId);
      if (result.valid) {
        console.log(`   ✅ Valid: ${result.title}`);
      } else {
        console.log(`   ❌ Invalid: ${result.error}`);
      }
    } else {
      console.log(`   ❌ Invalid: Not a YouTube URL`);
    }

    console.log('');
  }

  console.log('🎯 Summary:');
  console.log('- Some videos have valid YouTube URLs');
  console.log('- Some videos have invalid URLs (localhost, empty)');
  console.log('- Need to fix invalid URLs in database');
}

testAllVideos().catch(console.error);
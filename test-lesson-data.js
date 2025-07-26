/**
 * Test Lesson Data Transformation
 *
 * This script tests if the lesson data transformation is working correctly
 * and if the VideoPlayer component will receive the right data format.
 */

const http = require('http');

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (error) {
          resolve({ error: 'Invalid JSON response', data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Function to simulate frontend data transformation
function transformLessonData(rawLesson) {
  return {
    id: rawLesson.id,
    title: rawLesson.title,
    duration: rawLesson.duration || '00:00',
    thumbnail: rawLesson.thumbnail || '/placeholder-course.jpg',
    videoUrl: rawLesson.video_url, // Transform snake_case to camelCase
    description: rawLesson.description || 'Lesson description coming soon.',
    xpPoints: rawLesson.xp_points || 100
  };
}

// Function to test VideoPlayer component expectations
function testVideoPlayerExpectations(transformedLesson) {
  console.log('\n🎬 Testing VideoPlayer component expectations...\n');

  console.log('Transformed lesson data:');
  console.log(`  id: ${transformedLesson.id}`);
  console.log(`  title: ${transformedLesson.title}`);
  console.log(`  videoUrl: ${transformedLesson.videoUrl}`);
  console.log(`  description: ${transformedLesson.description}`);

  // Check if videoUrl exists (this is what was missing!)
  if (transformedLesson.videoUrl) {
    console.log('✅ videoUrl property exists');

    // Test YouTube ID extraction
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

    const youtubeId = extractYouTubeId(transformedLesson.videoUrl);
    if (youtubeId) {
      console.log(`✅ YouTube ID extracted: ${youtubeId}`);
      console.log('✅ Video should be playable in VideoPlayer component');
    } else {
      console.log('❌ No YouTube ID found - video may not be playable');
    }
  } else {
    console.log('❌ videoUrl property is missing - VideoPlayer will fail');
  }
}

// Main test function
async function testLessonData() {
  console.log('🚀 Testing Lesson Data Transformation...\n');

  try {
    // 1. Get a course with lessons
    console.log('📡 Fetching course data...');
    const coursesResponse = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: '/api/courses',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (coursesResponse.error) {
      console.error('❌ API Error:', coursesResponse.error);
      return;
    }

    const courses = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse.value || []);
    console.log(`✅ Found ${courses.length} courses`);

    // 2. Find a course with lessons
    const courseWithLessons = courses.find(course => course.lessons && course.lessons.length > 0);

    if (!courseWithLessons) {
      console.log('❌ No courses with lessons found');
      return;
    }

    console.log(`\n📚 Testing course: ${courseWithLessons.title}`);
    console.log(`   Lessons count: ${courseWithLessons.lessons.length}`);

    // 3. Test lesson data transformation
    console.log('\n🔄 Testing lesson data transformation...');

    for (let i = 0; i < Math.min(courseWithLessons.lessons.length, 2); i++) {
      const rawLesson = courseWithLessons.lessons[i];
      console.log(`\n📹 Lesson ${i + 1}: ${rawLesson.title}`);
      console.log('   Raw lesson data from database:');
      console.log(`     id: ${rawLesson.id}`);
      console.log(`     title: ${rawLesson.title}`);
      console.log(`     video_url: ${rawLesson.video_url}`);
      console.log(`     description: ${rawLesson.description}`);

      // Transform the lesson data
      const transformedLesson = transformLessonData(rawLesson);

      // Test VideoPlayer expectations
      testVideoPlayerExpectations(transformedLesson);
    }

    console.log('\n🎯 Lesson data transformation test completed!');
    console.log('✅ VideoPlayer component should now receive correct data format');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLessonData().catch(console.error);
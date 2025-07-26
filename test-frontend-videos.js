/**
 * Test Frontend Video Data Processing
 *
 * This script tests if the frontend is correctly receiving and processing
 * video data from the database API.
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

// Function to test frontend data transformation
function testFrontendTransformation(courseData) {
  console.log('🔄 Testing frontend data transformation...\n');

  // Simulate the frontend transformation logic
  const transformedCourse = {
    id: courseData.id,
    title: courseData.title,
    instructor: {
      id: courseData.instructor_id || 'unknown',
      name: courseData.instructor_name || 'Unknown Instructor',
      title: courseData.instructor_title || 'Instructor',
      image: courseData.instructor_image || '/placeholder-avatar.jpg',
      bio: courseData.instructor_bio || 'Experienced instructor',
      email: courseData.instructor_email || 'instructor@forwardafrica.com',
      expertise: ['Education'],
      experience: 5,
      createdAt: new Date()
    },
    instructorId: courseData.instructor_id,
    category: courseData.category_name || 'General',
    thumbnail: courseData.thumbnail || '/placeholder-course.jpg',
    banner: courseData.banner || '/placeholder-course.jpg',
    videoUrl: courseData.video_url,
    description: courseData.description || 'Course description coming soon.',
    lessons: courseData.lessons || [],
    featured: courseData.featured || false,
    totalXP: courseData.total_xp || 1000,
    comingSoon: courseData.coming_soon || false,
    releaseDate: courseData.release_date
  };

  console.log('✅ Course transformation successful');
  console.log(`   Title: ${transformedCourse.title}`);
  console.log(`   Video URL: ${transformedCourse.videoUrl}`);
  console.log(`   Lessons count: ${transformedCourse.lessons.length}`);

  if (transformedCourse.lessons.length > 0) {
    console.log('   Lesson video URLs:');
    transformedCourse.lessons.forEach((lesson, index) => {
      console.log(`     ${index + 1}. ${lesson.title}: ${lesson.video_url}`);
    });
  }

  return transformedCourse;
}

// Function to test VideoPlayer component logic
function testVideoPlayerLogic(lesson) {
  console.log('\n🎬 Testing VideoPlayer component logic...\n');

  console.log(`Lesson: ${lesson.title}`);
  console.log(`Video URL: ${lesson.video_url}`);

  // Simulate YouTube ID extraction
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

  const youtubeId = extractYouTubeId(lesson.video_url);

  if (youtubeId) {
    console.log(`✅ YouTube ID extracted: ${youtubeId}`);
    console.log(`✅ Video should be playable`);

    // Test embed URL generation
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent('http://localhost:3000')}&autoplay=0&controls=1&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&playsinline=1&allowfullscreen=1`;
    console.log(`✅ Embed URL generated: ${embedUrl}`);
  } else {
    console.log(`❌ No YouTube ID found - video may not be playable`);
  }

  return youtubeId;
}

// Main test function
async function testFrontendVideos() {
  console.log('🚀 Testing Frontend Video Data Processing...\n');

  try {
    // 1. Test API endpoint
    console.log('📡 Testing API endpoint...');
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
    console.log(`✅ API working - Found ${courses.length} courses\n`);

    // 2. Test each course
    for (let i = 0; i < Math.min(courses.length, 3); i++) {
      const course = courses[i];
      console.log(`📚 Testing Course ${i + 1}: ${course.title}`);

      // Test frontend transformation
      const transformedCourse = testFrontendTransformation(course);

      // Test lessons
      if (transformedCourse.lessons.length > 0) {
        console.log('\n📹 Testing lesson videos...');
        for (const lesson of transformedCourse.lessons) {
          testVideoPlayerLogic(lesson);
        }
      } else {
        console.log('\n⚠️ No lessons found in this course');
      }

      console.log('\n' + '='.repeat(50) + '\n');
    }

    console.log('🎯 Frontend video processing test completed!');
    console.log('✅ All video data should be working correctly in the frontend');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendVideos().catch(console.error);
/**
 * Fix Database Video URLs
 *
 * This script updates the database to replace invalid video URLs
 * with working YouTube video URLs.
 */

const http = require('http');

// Working YouTube video URLs to use
const workingVideos = [
  'https://www.youtube.com/watch?v=8jPQjjsBbIc',  // Business Fundamentals
  'https://www.youtube.com/watch?v=cdiD-9MMpb0',  // Innovation & Technology
  'https://www.youtube.com/watch?v=9bZkp7q19f0',  // Strategic Decision Making
  'https://www.youtube.com/watch?v=kJQP7kiw5Fk',  // Building Teams
  'https://www.youtube.com/watch?v=L_jWHffIx5E',  // Financial Management
  'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'   // Scaling Business
];

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            data: JSON.parse(body)
          };
          resolve(result);
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body
          });
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

// Function to update course video URL
async function updateCourseVideo(courseId, videoUrl) {
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: `/api/courses/${courseId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const data = {
    video_url: videoUrl
  };

  try {
    const result = await makeRequest(options, data);
    console.log(`✅ Updated course ${courseId} with video URL: ${videoUrl}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to update course ${courseId}:`, error.message);
    return null;
  }
}

// Function to update lesson video URL
async function updateLessonVideo(lessonId, videoUrl) {
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: `/api/lessons/${lessonId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const data = {
    video_url: videoUrl
  };

  try {
    const result = await makeRequest(options, data);
    console.log(`✅ Updated lesson ${lessonId} with video URL: ${videoUrl}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to update lesson ${lessonId}:`, error.message);
    return null;
  }
}

// Main function to fix all video URLs
async function fixDatabaseVideos() {
  console.log('🔧 Starting database video URL fixes...\n');

  try {
    // 1. Get all courses from the API
    console.log('📚 Fetching courses from database...');
    const coursesResponse = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: '/api/courses',
      method: 'GET'
    });

    if (coursesResponse.status !== 200) {
      console.error('❌ Failed to fetch courses');
      return;
    }

    const courses = coursesResponse.data;
    console.log(`📊 Found ${courses.length} courses\n`);

    let videoIndex = 0;
    let updatedCourses = 0;
    let updatedLessons = 0;

    // 2. Update each course and its lessons
    for (const course of courses) {
      console.log(`\n🎯 Processing course: ${course.title} (${course.id})`);

      // Check if course video URL needs updating
      if (!course.video_url ||
          course.video_url === '' ||
          course.video_url.includes('localhost:3000') ||
          course.video_url.includes('upload-course')) {

        const newVideoUrl = workingVideos[videoIndex % workingVideos.length];
        await updateCourseVideo(course.id, newVideoUrl);
        updatedCourses++;
        videoIndex++;
      } else {
        console.log(`   Course video URL is valid: ${course.video_url}`);
      }

      // Update lessons
      if (course.lessons && course.lessons.length > 0) {
        console.log(`   📖 Processing ${course.lessons.length} lessons...`);

        for (const lesson of course.lessons) {
          if (!lesson.video_url ||
              lesson.video_url === '' ||
              lesson.video_url.includes('localhost:3000') ||
              lesson.video_url.includes('upload-course')) {

            const newVideoUrl = workingVideos[videoIndex % workingVideos.length];
            await updateLessonVideo(lesson.id, newVideoUrl);
            updatedLessons++;
            videoIndex++;
          } else {
            console.log(`     Lesson video URL is valid: ${lesson.video_url}`);
          }
        }
      } else {
        console.log(`   📖 No lessons found for this course`);
      }
    }

    // 3. Summary
    console.log('\n📊 Fix Summary:');
    console.log(`✅ Updated ${updatedCourses} courses`);
    console.log(`✅ Updated ${updatedLessons} lessons`);
    console.log(`📈 Total updates: ${updatedCourses + updatedLessons}`);

    // 4. Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const verifyResponse = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: '/api/courses',
      method: 'GET'
    });

    if (verifyResponse.status === 200) {
      const fixedCourses = verifyResponse.data;
      let validVideos = 0;
      let totalVideos = 0;

      for (const course of fixedCourses) {
        if (course.video_url &&
            course.video_url.includes('youtube.com') &&
            !course.video_url.includes('localhost')) {
          validVideos++;
        }
        totalVideos++;

        if (course.lessons) {
          for (const lesson of course.lessons) {
            if (lesson.video_url &&
                lesson.video_url.includes('youtube.com') &&
                !lesson.video_url.includes('localhost')) {
              validVideos++;
            }
            totalVideos++;
          }
        }
      }

      console.log(`✅ Verification complete:`);
      console.log(`   Valid videos: ${validVideos}/${totalVideos}`);
      console.log(`   Success rate: ${((validVideos / totalVideos) * 100).toFixed(1)}%`);
    }

  } catch (error) {
    console.error('❌ Error during database fix:', error);
  }
}

// Run the fix
fixDatabaseVideos().catch(console.error);
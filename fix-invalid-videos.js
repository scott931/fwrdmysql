/**
 * Fix Invalid Video URLs in Database
 *
 * This script replaces invalid video URLs in the database with working YouTube videos.
 */

const http = require('http');

// Working YouTube video URLs to use as replacements
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

// Function to check if a URL is invalid
function isInvalidUrl(url) {
  if (!url || url.trim() === '') return true;
  if (url.includes('localhost:3000')) return true;
  if (url.includes('admin/upload-course')) return true;
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) return true;
  return false;
}

// Function to get a random working video URL
function getRandomWorkingVideo() {
  const randomIndex = Math.floor(Math.random() * workingVideos.length);
  return workingVideos[randomIndex];
}

// Function to fix course video URLs
async function fixCourseVideos() {
  console.log('🔧 Fixing invalid course video URLs...\n');

  try {
    // Get all courses
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
      console.error('❌ Error fetching courses:', coursesResponse.error);
      return;
    }

    // Handle both array and object with value property
    const courses = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse.value || []);
    console.log(`📊 Found ${courses.length} courses to check`);

    let fixedCount = 0;

    for (const course of courses) {
      if (isInvalidUrl(course.video_url)) {
        console.log(`🔧 Fixing course: ${course.title}`);
        console.log(`   Old URL: ${course.video_url || 'Empty'}`);

        const newVideoUrl = getRandomWorkingVideo();
        console.log(`   New URL: ${newVideoUrl}`);

        try {
          const updateResponse = await makeRequest({
            hostname: 'localhost',
            port: 3002,
            path: `/api/courses/${course.id}`,
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            }
          }, {
            video_url: newVideoUrl
          });

          if (updateResponse.error) {
            console.log(`   ❌ Failed to update course: ${updateResponse.error}`);
          } else {
            console.log(`   ✅ Course updated successfully`);
            fixedCount++;
          }
        } catch (error) {
          console.log(`   ❌ Error updating course: ${error.message}`);
        }

        console.log('');
      }
    }

    console.log(`🎯 Fixed ${fixedCount} course video URLs`);
  } catch (error) {
    console.error('❌ Error in fixCourseVideos:', error.message);
  }
}

// Function to get lessons for a course
async function getLessonsForCourse(courseId) {
  try {
    const lessonsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: `/api/lessons/${courseId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (lessonsResponse.error) {
      console.log(`   ❌ Error fetching lessons for course ${courseId}: ${lessonsResponse.error}`);
      return [];
    }

    // Handle both array and single object responses
    if (Array.isArray(lessonsResponse)) {
      return lessonsResponse;
    } else if (lessonsResponse && typeof lessonsResponse === 'object') {
      return [lessonsResponse];
    } else {
      return [];
    }
  } catch (error) {
    console.log(`   ❌ Error fetching lessons for course ${courseId}: ${error.message}`);
    return [];
  }
}

// Function to fix lesson video URLs
async function fixLessonVideos() {
  console.log('🔧 Fixing invalid lesson video URLs...\n');

  try {
    // Get all courses
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
      console.error('❌ Error fetching courses:', coursesResponse.error);
      return;
    }

    // Handle both array and object with value property
    const courses = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse.value || []);
    let fixedCount = 0;

    for (const course of courses) {
      console.log(`📚 Checking lessons for course: ${course.title}`);

      // Check if course has lessons array
      if (course.lessons && Array.isArray(course.lessons) && course.lessons.length > 0) {
        console.log(`   Found ${course.lessons.length} lessons in course data`);

        for (const lesson of course.lessons) {
          if (isInvalidUrl(lesson.video_url)) {
            console.log(`🔧 Fixing lesson: ${lesson.title}`);
            console.log(`   Old URL: ${lesson.video_url || 'Empty'}`);

            const newVideoUrl = getRandomWorkingVideo();
            console.log(`   New URL: ${newVideoUrl}`);

            try {
              const updateResponse = await makeRequest({
                hostname: 'localhost',
                port: 3002,
                path: `/api/lessons/${lesson.id}`,
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                }
              }, {
                video_url: newVideoUrl
              });

              if (updateResponse.error) {
                console.log(`   ❌ Failed to update lesson: ${updateResponse.error}`);
              } else {
                console.log(`   ✅ Lesson updated successfully`);
                fixedCount++;
              }
            } catch (error) {
              console.log(`   ❌ Error updating lesson: ${error.message}`);
            }

            console.log('');
          } else {
            console.log(`   ✅ Lesson "${lesson.title}" has valid URL: ${lesson.video_url}`);
          }
        }
      } else {
        console.log(`   No lessons found in course data`);
      }

      console.log('');
    }

    console.log(`🎯 Fixed ${fixedCount} lesson video URLs`);
  } catch (error) {
    console.error('❌ Error in fixLessonVideos:', error.message);
  }
}

// Main function
async function fixAllVideos() {
  console.log('🚀 Starting video URL fix process...\n');

  await fixCourseVideos();
  console.log('');
  await fixLessonVideos();

  console.log('\n✅ Video URL fix process completed!');
  console.log('🔄 Please restart your application to see the changes.');
}

fixAllVideos().catch(console.error);
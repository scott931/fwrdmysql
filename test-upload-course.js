// test-upload-course.js
const http = require('http');

async function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let responseData = '';
      res.on('data', chunk => { responseData += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  console.log('🚀 Starting upload test...\n');

  // 1. Create a course
  console.log('📚 Creating test course...');
  const courseData = {
    title: "Test Course " + Date.now(),
    description: "A course created by test script.",
    instructor_id: "instructor-1",
    category_id: "category-1",
    thumbnail: "test-thumbnail.jpg",
    banner: "test-banner.jpg",
    video_url: "",
    featured: false,
    total_xp: 100
  };

  const courseOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/courses',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const courseResult = await makeRequest(courseOptions, courseData);
    console.log('Course POST result:', courseResult);

    if (courseResult.status !== 201) {
      console.error('❌ Failed to create course. Status:', courseResult.status);
      return;
    }

    if (!courseResult.data.id) {
      console.error('❌ Course created but no ID returned');
      return;
    }

    console.log('✅ Course created successfully with ID:', courseResult.data.id);

    // 2. Create a lesson for the course
    console.log('\n📖 Creating test lesson...');
    const lessonData = {
      course_id: courseResult.data.id,
      title: "Test Lesson",
      duration: "10:00",
      thumbnail: "test-lesson-thumbnail.jpg",
      video_url: "https://example.com/video.mp4",
      description: "A lesson created by test script.",
      xp_points: 100,
      order_index: 0
    };

    const lessonOptions = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/lessons',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const lessonResult = await makeRequest(lessonOptions, lessonData);
    console.log('Lesson POST result:', lessonResult);

    if (lessonResult.status === 201) {
      console.log('✅ Lesson created successfully with ID:', lessonResult.data.id);
      console.log('\n🎉 Upload test completed successfully!');
      console.log('📊 Summary:');
      console.log(`   - Course ID: ${courseResult.data.id}`);
      console.log(`   - Lesson ID: ${lessonResult.data.id}`);
      console.log('\n💡 You can now check your database to verify the data was saved.');
    } else {
      console.error('❌ Failed to create lesson. Status:', lessonResult.status);
    }

  } catch (error) {
    console.error('❌ Test script error:', error);
  }
}

main();
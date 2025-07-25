// test-complete-upload.js
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
  console.log('🚀 Starting complete upload test...\n');

  try {
    // 1. Create a category first
    console.log('📂 Creating test category...');
    const categoryData = {
      id: "test-category-1",
      name: "Test Category",
      description: "A test category for upload testing"
    };

    const categoryOptions = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/categories',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const categoryResult = await makeRequest(categoryOptions, categoryData);
    console.log('Category POST result:', categoryResult);

    if (categoryResult.status !== 201) {
      console.error('❌ Failed to create category. Status:', categoryResult.status);
      return;
    }

    console.log('✅ Category created successfully');

    // 2. Create an instructor
    console.log('\n👨‍🏫 Creating test instructor...');
    const instructorData = {
      id: "test-instructor-1",
      name: "Test Instructor",
      title: "Senior Developer",
      image: "https://example.com/instructor.jpg",
      bio: "A test instructor for upload testing",
      email: "test@example.com",
      phone: "+1234567890",
      expertise: ["JavaScript", "React", "Node.js"],
      experience: 5,
      social_links: {
        linkedin: "https://linkedin.com/in/test",
        twitter: "https://twitter.com/test"
      }
    };

    const instructorOptions = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/instructors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const instructorResult = await makeRequest(instructorOptions, instructorData);
    console.log('Instructor POST result:', instructorResult);

    if (instructorResult.status !== 201) {
      console.error('❌ Failed to create instructor. Status:', instructorResult.status);
      return;
    }

    console.log('✅ Instructor created successfully');

    // 3. Create a course using the valid IDs
    console.log('\n📚 Creating test course...');
    const courseData = {
      title: "Complete Test Course " + Date.now(),
      description: "A course created by complete test script.",
      instructor_id: "test-instructor-1",
      category_id: "test-category-1",
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

    const courseResult = await makeRequest(courseOptions, courseData);
    console.log('Course POST result:', courseResult);

    if (courseResult.status !== 201) {
      console.error('❌ Failed to create course. Status:', courseResult.status);
      return;
    }

    console.log('✅ Course created successfully with ID:', courseResult.data.id);

    // 4. Create a lesson for the course
    console.log('\n📖 Creating test lesson...');
    const lessonData = {
      course_id: courseResult.data.id,
      title: "Test Lesson",
      duration: "10:00",
      thumbnail: "test-lesson-thumbnail.jpg",
      video_url: "https://example.com/video.mp4",
      description: "A lesson created by complete test script.",
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
    } else {
      console.error('❌ Failed to create lesson. Status:', lessonResult.status);
      return;
    }

    // 5. Verify the data was saved by retrieving it
    console.log('\n🔍 Verifying data was saved...');

    // Get all courses
    const getCoursesOptions = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/courses',
      method: 'GET'
    };

    const coursesResult = await makeRequest(getCoursesOptions);
    console.log('Courses GET result status:', coursesResult.status);

    if (coursesResult.status === 200 && Array.isArray(coursesResult.data)) {
      console.log(`✅ Found ${coursesResult.data.length} courses in database`);
      if (coursesResult.data.length > 0) {
        console.log('📋 Course details:', {
          id: coursesResult.data[0].id,
          title: coursesResult.data[0].title,
          instructor_name: coursesResult.data[0].instructor_name,
          category_name: coursesResult.data[0].category_name,
          lessons_count: coursesResult.data[0].lessons ? coursesResult.data[0].lessons.length : 0
        });
      }
    } else {
      console.error('❌ Failed to retrieve courses');
    }

    console.log('\n🎉 Complete upload test finished!');
    console.log('📊 Summary:');
    console.log(`   - Category ID: ${categoryData.id}`);
    console.log(`   - Instructor ID: ${instructorData.id}`);
    console.log(`   - Course ID: ${courseResult.data.id}`);
    console.log(`   - Lesson ID: ${lessonResult.data.id}`);
    console.log('\n💡 All data should now be properly stored in your database.');

  } catch (error) {
    console.error('❌ Test script error:', error);
  }
}

main();

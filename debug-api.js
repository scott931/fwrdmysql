/**
 * Debug API Response Format
 */

const http = require('http');

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

async function debugAPI() {
  console.log('🔍 Debugging API responses...\n');

  try {
    // Test courses endpoint
    console.log('📊 Testing /api/courses endpoint...');
    const coursesResponse = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: '/api/courses',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Courses Response Type:', typeof coursesResponse);
    console.log('Courses Response Keys:', Object.keys(coursesResponse));

    if (coursesResponse.value) {
      console.log('Courses Count:', coursesResponse.value.length);
      console.log('First Course:', JSON.stringify(coursesResponse.value[0], null, 2));
    } else {
      console.log('Full Response:', JSON.stringify(coursesResponse, null, 2));
    }

    console.log('\n📚 Testing /api/lessons endpoint...');
    const lessonsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: '/api/lessons/f995a777-ad8e-465f-bbb2-7458a613a8bc',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Lessons Response Type:', typeof lessonsResponse);
    console.log('Lessons Response:', JSON.stringify(lessonsResponse, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAPI();
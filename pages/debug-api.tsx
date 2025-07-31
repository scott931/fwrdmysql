import { useEffect, useState } from 'react';

export default function DebugAPI() {
  const [apiStatus, setApiStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAPI = async () => {
      const results: any = {};

      try {
        // Test 1: Basic API health
        console.log('🔍 Testing API health...');
        const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/health`);
        results.health = {
          status: healthResponse.status,
          ok: healthResponse.ok,
          data: await healthResponse.json()
        };
        console.log('✅ Health check result:', results.health);
      } catch (error) {
        results.health = { error: error instanceof Error ? error.message : 'Unknown error' };
        console.error('❌ Health check failed:', error);
      }

      try {
        // Test 2: Get all courses
        console.log('🔍 Testing courses endpoint...');
        const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/courses`);
        results.courses = {
          status: coursesResponse.status,
          ok: coursesResponse.ok,
          data: await coursesResponse.json()
        };
        console.log('✅ Courses result:', results.courses);
      } catch (error) {
        results.courses = { error: error instanceof Error ? error.message : 'Unknown error' };
        console.error('❌ Courses fetch failed:', error);
      }

      try {
        // Test 3: Get specific course (ID 2)
        console.log('🔍 Testing specific course endpoint...');
        const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/courses/2`);
        results.specificCourse = {
          status: courseResponse.status,
          ok: courseResponse.ok,
          data: await courseResponse.json()
        };
        console.log('✅ Specific course result:', results.specificCourse);
      } catch (error) {
        results.specificCourse = { error: error instanceof Error ? error.message : 'Unknown error' };
        console.error('❌ Specific course fetch failed:', error);
      }

      setApiStatus(results);
      setLoading(false);
    };

    testAPI();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4">Testing API endpoints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🐛 API Debug Page</h1>

        <div className="space-y-6">
          {/* Health Check */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Health Check</h2>
            <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(apiStatus.health, null, 2)}
            </pre>
          </div>

          {/* Courses Endpoint */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Courses Endpoint</h2>
            <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(apiStatus.courses, null, 2)}
            </pre>
          </div>

          {/* Specific Course Endpoint */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Specific Course (ID: 2)</h2>
            <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(apiStatus.specificCourse, null, 2)}
            </pre>
          </div>

          {/* Summary */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span>Health Check:</span>
                <span className={apiStatus.health?.ok ? 'text-green-400' : 'text-red-400'}>
                  {apiStatus.health?.ok ? '✅ Working' : '❌ Failed'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Courses Endpoint:</span>
                <span className={apiStatus.courses?.ok ? 'text-green-400' : 'text-red-400'}>
                  {apiStatus.courses?.ok ? '✅ Working' : '❌ Failed'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Specific Course:</span>
                <span className={apiStatus.specificCourse?.ok ? 'text-green-400' : 'text-red-400'}>
                  {apiStatus.specificCourse?.ok ? '✅ Working' : '❌ Failed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
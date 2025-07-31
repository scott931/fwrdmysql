import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function TestLessonUrl() {
  const router = useRouter();
  const [apiResults, setApiResults] = useState<Record<string, any>>({});

  // Updated test URLs using actual course and lesson IDs from the database
  const testUrls = [
    '/course/1/lesson/1',           // Course 1 - Introduction to Entrepreneurship
    '/course/1/lesson/2',           // Course 1 - Business Planning Fundamentals
    '/course/1/lesson/3',           // Course 1 - Financial Management Basics
    '/course/2/lesson/4',           // Course 2 - Social Media Marketing
    '/course/2/lesson/5',           // Course 2 - SEO Fundamentals
    '/course/3/lesson/6',           // Course 3 - Personal Finance Basics
    '/course/3/lesson/7',           // Course 3 - Investment Strategies
    '/course/4/lesson/8',           // Course 4 - Modern Leadership Principles
    '/course/4/lesson/9',           // Course 4 - Team Management Skills
    '/course/76/lesson/85',         // Course 76 - Introduction to Entrepreneurship
    '/course/77/lesson/100',        // Course 77 - Introduction to Technology Innovation
    '/course/77/lesson/101',        // Course 77 - Innovation Strategy Development
    '/course/77/lesson/102'         // Course 77 - Digital Transformation
  ];

  const testApi = async (endpoint: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api${endpoint}`);
      const data = await response.json();
      setApiResults((prev: Record<string, any>) => ({ ...prev, [endpoint]: data }));
      console.log(`API Response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      setApiResults((prev: Record<string, any>) => ({
        ...prev,
        [endpoint]: { error: error instanceof Error ? error.message : 'Unknown error' }
      }));
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Lesson URL Test Page</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test URLs</h2>
          <div className="space-y-4">
            {testUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Link
                  href={url}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
                >
                  Test: {url}
                </Link>
                <span className="text-gray-400 text-sm">
                  Should navigate to lesson page
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <div className="space-y-4">
            <button
              onClick={() => testApi('/health')}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors mr-4"
            >
              Test Health API
            </button>

            <button
              onClick={() => testApi('/courses')}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors mr-4"
            >
              Test Courses API
            </button>

            <button
              onClick={() => testApi('/courses/1')}
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-md transition-colors mr-4"
            >
              Test Course 1 API
            </button>

            <button
              onClick={() => testApi('/courses/77')}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition-colors"
            >
              Test Course 77 API
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Results</h2>
          <div className="space-y-4">
            {Object.entries(apiResults).map(([endpoint, data]) => (
              <div key={endpoint} className="border border-gray-600 rounded p-4">
                <h3 className="font-semibold mb-2">{endpoint}</h3>
                <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Router Info</h2>
          <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({
              pathname: router.pathname,
              asPath: router.asPath,
              query: router.query,
              isReady: router.isReady
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
          <div className="space-y-2">
            <Link href="/" className="block text-red-400 hover:text-red-300">
              ← Back to Home
            </Link>
            <Link href="/courses" className="block text-red-400 hover:text-red-300">
              → Go to Courses
            </Link>
            <Link href="/test-lesson-url" className="block text-red-400 hover:text-red-300">
              ↻ Refresh Test Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
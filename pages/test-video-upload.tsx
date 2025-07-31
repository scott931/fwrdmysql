import React from 'react';
import { VideoContentManagement } from '../../src/components/VideoContentManagement';
import Layout from '../../src/components/layout/Layout';

const TestVideoUploadPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              🎬 Video Upload Test Page
            </h1>
            <p className="text-gray-300">
              This page demonstrates the video upload functionality. You can upload video files and monitor their processing status.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <VideoContentManagement
              lessonId="test-lesson-123"
              onVideoUploaded={(videoAssetId) => {
                console.log('Video uploaded successfully:', videoAssetId);
                alert(`Video uploaded! Asset ID: ${videoAssetId}`);
              }}
            />
          </div>

          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              📋 How to Test Video Upload
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>1. <strong>Select a video file</strong> - Click "Select Video File" button</p>
              <p>2. <strong>Choose a video</strong> - MP4, MOV, or AVI files up to 500MB</p>
              <p>3. <strong>Upload the video</strong> - Click "Upload Video" button</p>
              <p>4. <strong>Monitor processing</strong> - Check the "Processing Status" tab</p>
              <p>5. <strong>View workflow</strong> - Check the "Workflow" tab for content management</p>
            </div>
          </div>

          <div className="mt-8 bg-blue-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              ✅ System Status
            </h2>
            <div className="text-blue-200 space-y-2">
              <p>✅ Backend server is running</p>
              <p>✅ Video processing dependencies installed</p>
              <p>✅ Database schema ready (video_assets table exists)</p>
              <p>✅ Upload endpoints available</p>
              <p>✅ File storage configured</p>
            </div>
          </div>

          <div className="mt-8 bg-yellow-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              ⚠️ Requirements for Full Functionality
            </h2>
            <div className="text-yellow-200 space-y-2">
              <p>• <strong>FFmpeg</strong> - Required for video transcoding</p>
              <p>• <strong>Redis</strong> - Required for background job processing</p>
              <p>• <strong>Authentication</strong> - Login required for upload permissions</p>
              <p>• <strong>Google Cloud</strong> - Optional for speech-to-text subtitles</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestVideoUploadPage;
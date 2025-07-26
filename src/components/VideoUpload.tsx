import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { ErrorMessage } from './ui/ErrorMessage';
import { SuccessMessage } from './ui/SuccessMessage';

interface VideoUploadProps {
  lessonId: string;
  onUploadComplete?: (videoAssetId: string) => void;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ lessonId, onUploadComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        setError('File size exceeds 500MB limit');
        return;
      }
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', selectedFile.name);
    formData.append('description', 'Video upload');

    try {
      const response = await fetch(`/api/video-content/upload/${lessonId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setSuccess('Video upload started successfully. Processing jobs have been queued.');

      if (onUploadComplete) {
        onUploadComplete(result.videoAssetId);
      }
    } catch (error) {
      setError('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Video</h2>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="space-y-4">
          <div className="text-gray-600">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Select Video File
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            MP4, MOV, AVI up to 500MB
          </p>
        </div>
      </div>

      {selectedFile && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Selected File:</h3>
          <p className="text-sm text-gray-600">
            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </div>
      )}
    </div>
  );
};
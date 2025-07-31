import { NextApiRequest, NextApiResponse } from 'next';
import { formidable } from 'formidable';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Types for the upload
interface UploadedFile {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

interface ParsedForm {
  fields: formidable.Fields;
  files: formidable.Files;
}

// Parse form data with formidable
const parseForm = (req: NextApiRequest): Promise<ParsedForm> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      uploadDir: path.join(process.cwd(), 'public', 'uploads', 'banners'),
      keepExtensions: true,
      filename: (name, ext, part) => {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        return `banner-${timestamp}-${randomId}${ext}`;
      },
      filter: (part) => {
        // Log what's being processed
        console.log('🔍 Processing part:', part.name, part.mimetype);
        return true;
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('❌ Formidable parse error:', err);
        reject(err);
        return;
      }
      console.log('✅ Formidable parse successful');
      resolve({ fields, files });
    });
  });
};

// Validate file type
const isValidFileType = (mimetype: string): boolean => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'video/x-msvideo', 'video/avi', 'video/mov'
  ];
  return allowedTypes.includes(mimetype);
};

// Get file type category
const getFileType = (mimetype: string): 'image' | 'video' => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'image'; // fallback
};

// Create upload directory if it doesn't exist
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banners');
  try {
    await fsPromises.access(uploadDir);
    console.log('✅ Upload directory exists:', uploadDir);
  } catch {
    console.log('📁 Creating upload directory:', uploadDir);
    await fsPromises.mkdir(uploadDir, { recursive: true });
    console.log('✅ Upload directory created');
  }
  return uploadDir;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎬 Banner upload request received');
    console.log('📋 Request headers:', req.headers);
    console.log('📋 Request method:', req.method);
    console.log('📋 Request url:', req.url);

    // Ensure upload directory exists
    await ensureUploadDir();

    // Parse the form data
    const { fields, files } = await parseForm(req);

    console.log('📁 Parsed form data:');
    console.log('📁 Fields:', fields);
    console.log('📁 Files:', Object.keys(files));

    // Check if file was uploaded
    const uploadedFile = files.banner?.[0] as formidable.File;
    if (!uploadedFile) {
      console.log('❌ No banner file found in request');
      console.log('📁 Available files:', files);
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📁 File received: ${uploadedFile.originalFilename} (${uploadedFile.mimetype}, ${(uploadedFile.size / (1024 * 1024)).toFixed(1)}MB)`);

    // Validate file type
    if (!isValidFileType(uploadedFile.mimetype || '')) {
      // Clean up invalid file
      if (fs.existsSync(uploadedFile.filepath)) {
        fs.unlinkSync(uploadedFile.filepath);
      }
      return res.status(400).json({
        error: 'Invalid file type. Only images (JPEG, PNG, WebP) and videos (MP4, WebM, OGG, MOV) are allowed.'
      });
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (uploadedFile.size > maxSize) {
      // Clean up oversized file
      if (fs.existsSync(uploadedFile.filepath)) {
        fs.unlinkSync(uploadedFile.filepath);
      }
      return res.status(400).json({
        error: `File is too large (${(uploadedFile.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 100MB.`
      });
    }

    // Determine file type
    const fileType = getFileType(uploadedFile.mimetype || '');

    // Generate public URL
    const fileName = path.basename(uploadedFile.filepath);
    const publicUrl = `/uploads/banners/${fileName}`;

    console.log(`✅ File uploaded successfully: ${publicUrl}`);

    // Return success response
    res.status(200).json({
      success: true,
      url: publicUrl,
      fileType: fileType,
      size: uploadedFile.size,
      originalName: uploadedFile.originalFilename,
      message: `${fileType === 'video' ? 'Video' : 'Image'} uploaded successfully!`
    });

  } catch (error) {
    console.error('❌ Upload error:', error);

    let errorMessage = 'Upload failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
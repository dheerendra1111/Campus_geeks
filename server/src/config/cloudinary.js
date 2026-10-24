import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary SDK
const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] Image storage configured successfully.');
} else {
  console.log(
    '[Cloudinary Notice] Cloudinary keys not detected in .env. Falling back to local data-URI/placeholder storage for development.'
  );
}

/**
 * Upload a file buffer to Cloudinary with fallback to Base64 data-URI if not configured
 * @param {Buffer} fileBuffer - The in-memory buffer of the uploaded file
 * @param {string} mimeType - e.g. "image/jpeg"
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<string>} The secure URL or data-URI string
 */
export const uploadImageBuffer = async (fileBuffer, mimeType = 'image/jpeg', folder = 'campusgeeks') => {
  if (!isConfigured) {
    // Development fallback: return base64 Data URI so images display immediately without API keys
    const base64 = fileBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;

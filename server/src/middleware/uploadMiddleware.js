import multer from 'multer';

// Use in-memory buffer storage so files can be piped directly to Cloudinary or Data-URI
const storage = multer.memoryStorage();

// File filter: accept only jpeg, png, and webp images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes max per file
    files: 5, // Maximum 5 images per item
  },
});

export default upload;

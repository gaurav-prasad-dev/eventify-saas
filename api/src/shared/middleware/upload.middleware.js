const multer = require('multer');
const AppError = require('../errors/AppError');

// Memory storage keeps uploaded files in RAM buffer for direct streaming to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

// Middleware for event images: banner, thumbnail, and gallery
const uploadEventMedia = upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);

module.exports = {
  upload,
  uploadEventMedia,
};

const multer = require('multer');
const path = require('path');
const APIError = require('../utils/APIError');

const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new APIError('Only JPEG, PNG, and WebP images are allowed', 400), false);
  }
};

const profilePictureFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new APIError('Only JPEG and PNG images are allowed for profile pictures', 400), false);
  }
};

const storage = multer.memoryStorage();

const uploadProfilePicture = multer({
  storage,
  fileFilter: profilePictureFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
}).single('profilePicture');

const uploadPostImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
}).array('images', 10); // Max 10 images

// Middleware wrapper for error handling
const handleUpload = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new APIError('File size exceeds the limit', 400));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new APIError('Too many files uploaded', 400));
        }
        return next(new APIError(err.message, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  uploadProfilePicture: handleUpload(uploadProfilePicture),
  uploadPostImages: handleUpload(uploadPostImages),
};

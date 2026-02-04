const ImageKit = require('imagekit');
const logger = require('../config/logger');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const uploadImage = async (file, folder, fileName) => {
  try {
    const response = await imagekit.upload({
      file: file.buffer.toString('base64'),
      fileName: fileName || `${Date.now()}-${file.originalname}`,
      folder: folder || '/blog',
    });

    logger.info(`Image uploaded to ImageKit: ${response.fileId}`);

    return {
      fileId: response.fileId,
      url: response.url,
      thumbnailUrl: response.thumbnailUrl,
      name: response.name,
    };
  } catch (error) {
    logger.error(`ImageKit upload error: ${error.message}`);
    throw error;
  }
};

const deleteImage = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
    logger.info(`Image deleted from ImageKit: ${fileId}`);
  } catch (error) {
    logger.error(`ImageKit delete error: ${error.message}`);
    throw error;
  }
};

const getImageUrl = (path, transformations = {}) => {
  const defaultTransformations = {
    quality: 80,
    ...transformations,
  };

  return imagekit.url({
    path,
    transformation: [defaultTransformations],
  });
};

const getThumbnailUrl = (path, width = 150, height = 150) => {
  return imagekit.url({
    path,
    transformation: [
      {
        width,
        height,
        crop: 'at_max',
        quality: 70,
      },
    ],
  });
};

module.exports = {
  uploadImage,
  deleteImage,
  getImageUrl,
  getThumbnailUrl,
};

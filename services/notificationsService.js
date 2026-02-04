const mongoose = require('mongoose');
const Notification = require('../models/notificationsModel');
const APIError = require('../utils/APIError');


const createNotification = async (notificationData) => {
  const notification = await Notification.create(notificationData);
  return notification;
};

const getUserNotifications = async (userId, query = {}) => {
  let { page = 1, limit = 20, unreadOnly = false } = query;
  page = Number(page);
  limit = Number(limit);

  const filter = { userId };
  if (unreadOnly === 'true' || unreadOnly === true) {
    filter.read = false;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('relatedUserId', 'name email profilePicture')
    .populate('relatedPostId', 'title')
    .populate('relatedCommentId', 'content');

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ userId, read: false });

  return {
    notifications,
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const markAsRead = async (notificationId, userId) => {
  if (!mongoose.isValidObjectId(notificationId)) {
    throw new APIError('Invalid notification ID', 400);
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new APIError('Notification not found', 404);
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, read: false }, { read: true });
  return { message: 'All notifications marked as read' };
};

const deleteNotification = async (notificationId, userId) => {
  if (!mongoose.isValidObjectId(notificationId)) {
    throw new APIError('Invalid notification ID', 400);
  }

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId,
  });

  if (!notification) {
    throw new APIError('Notification not found', 404);
  }

  return { message: 'Notification deleted' };
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

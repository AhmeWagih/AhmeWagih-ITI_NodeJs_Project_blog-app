const notificationsService = require('../services/notificationsService');

// GET /notifications
const getUserNotifications = async (req, res, next) => {
  try {
    const result = await notificationsService.getUserNotifications(req.user.userId, req.query);
    res.status(200).json({
      status: 'success',
      data: result.notifications,
      unreadCount: result.unreadCount,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationsService.markAsRead(req.params.id, req.user.userId);
    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationsService.markAllAsRead(req.user.userId);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (err) {
    next(err);
  }
};

// DELETE /notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationsService.deleteNotification(req.params.id, req.user.userId);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

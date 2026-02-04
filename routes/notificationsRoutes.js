const express = require('express');
const notificationsController = require('../controllers/notificationsControllers');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

// Get all notifications
router.get('/', authenticate, notificationsController.getUserNotifications);

// Mark all as read
router.patch('/read-all', authenticate, notificationsController.markAllAsRead);

// Mark single notification as read
router.patch('/:id/read', authenticate, notificationsController.markAsRead);

// Delete notification
router.delete('/:id', authenticate, notificationsController.deleteNotification);

module.exports = router;

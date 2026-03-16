const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await notificationService.getAllNotifications(req.user.id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/broadcast', protect, adminOnly, async (req, res) => {
  try {
    const { message } = req.body;
    const result = await notificationService.broadcastNotification(message);
    res.status(201).json({ message: `Notification sent to ${result.count} users.` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
const Notification = require('../models/Notification');
const User = require('../models/User');

const getAllNotifications = async (userId) => {
  return await Notification.find({ userId }).populate('songId').sort({ createdAt: -1 });
};


const markAsRead = async (id, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { isRead: true },
    { returnDocument: 'after' }
  );
  if (!notification) throw new Error('Notification not found');
  return notification;
};


const broadcastNotification = async (message) => {
  if (!message || !message.trim()) throw new Error('Message is required');

  const allUsers = await User.find({}, '_id');
  if (allUsers.length === 0) return { count: 0 };

  const notifications = allUsers.map(u => ({
    userId:  u._id,
    type:    'system',
    message: message.trim(),
  }));

  await Notification.insertMany(notifications);
  return { count: allUsers.length };
};

module.exports = { getAllNotifications, markAsRead, broadcastNotification };
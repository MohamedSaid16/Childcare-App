const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Create notification for a single user
  async createUserNotification(userId, notificationData) {
    try {
      const notification = await Notification.create({
        user: userId,
        ...notificationData
      });
      return notification;
    } catch (error) {
      throw error;
    }
  }

  // Create notifications for multiple users
  async createBulkNotifications(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        user: userId,
        ...notificationData
      }));

      return await Notification.insertMany(notifications);
    } catch (error) {
      throw error;
    }
  }

  // Create notification for all users of a specific role
  async createRoleNotification(role, notificationData) {
    try {
      const users = await User.find({ role, isActive: true }).select('_id');
      const userIds = users.map(user => user._id);

      return await this.createBulkNotifications(userIds, notificationData);
    } catch (error) {
      throw error;
    }
  }

  // Create notification for parents of specific children
  async createParentNotification(childIds, notificationData) {
    try {
      const Child = require('../models/Child');
      const children = await Child.find({ _id: { $in: childIds } }).populate('parent');
      const parentIds = children.map(child => child.parent._id);

      // Remove duplicates
      const uniqueParentIds = [...new Set(parentIds.map(id => id.toString()))];

      return await this.createBulkNotifications(uniqueParentIds, notificationData);
    } catch (error) {
      throw error;
    }
  }

  // Mark notifications as read
  async markNotificationsAsRead(notificationIds, userId) {
    try {
      await Notification.updateMany(
        { 
          _id: { $in: notificationIds },
          user: userId 
        },
        { isRead: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Get unread notification count for user
  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({ 
        user: userId, 
        isRead: false 
      });
    } catch (error) {
      throw error;
    }
  }

  // Clean up old notifications (older than 30 days)
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isRead: true
      });

      return result.deletedCount;
    } catch (error) {
      throw error;
    }
  }

  // Send push notification (placeholder for actual push service integration)
  async sendPushNotification(userId, title, message) {
    try {
      // This would integrate with services like Firebase Cloud Messaging
      // For now, we'll just log it
      console.log(`Push notification to user ${userId}: ${title} - ${message}`);
      
      // Implementation for FCM would go here:
      /*
      const fcmMessage = {
        token: userFCMToken, // You'd need to store FCM tokens in user model
        notification: {
          title: title,
          body: message
        }
      };
      
      await admin.messaging().send(fcmMessage);
      */
    } catch (error) {
      console.error('Push notification error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
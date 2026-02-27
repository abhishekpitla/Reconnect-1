const User = require('./User');
const Activity = require('./Activity');
const Connection = require('./Connection');
const Engagement = require('./Engagement');
const Notification = require('./Notification');
const ChatMessage = require('./ChatMessage');

// User <-> Activity
User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Connection associations
User.hasMany(Connection, { foreignKey: 'requesterId', as: 'sentRequests' });
User.hasMany(Connection, { foreignKey: 'recipientId', as: 'receivedRequests' });
Connection.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
Connection.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

// Engagement associations
User.hasMany(Engagement, { foreignKey: 'userId', as: 'engagements' });
Activity.hasMany(Engagement, { foreignKey: 'activityId', as: 'engagements' });
Engagement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Engagement.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Notification.belongsTo(User, { foreignKey: 'relatedUserId', as: 'relatedUser' });
Notification.belongsTo(Activity, { foreignKey: 'relatedActivityId', as: 'relatedActivity' });

// Chat associations
Activity.hasMany(ChatMessage, { foreignKey: 'activityId', as: 'messages' });
ChatMessage.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' });
User.hasMany(ChatMessage, { foreignKey: 'userId', as: 'messages' });
ChatMessage.belongsTo(User, { foreignKey: 'user', as: 'sender' });

module.exports = { User, Activity, Connection, Engagement, Notification, ChatMessage };

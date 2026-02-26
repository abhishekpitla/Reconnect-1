const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    type: {
        type: DataTypes.ENUM('engagement', 'new_activity', 'connection_request', 'connection_accepted'),
        allowNull: false,
    },
    relatedActivityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'activities', key: 'id' },
    },
    relatedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    message: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'notifications',
    timestamps: true,
});

module.exports = Notification;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Engagement = sequelize.define('Engagement', {
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
    activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'activities', key: 'id' },
    },
    type: {
        type: DataTypes.ENUM('interested', 'me_too'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        defaultValue: 'pending',
    },
}, {
    tableName: 'engagements',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['userId', 'activityId', 'type'] },
    ],
});

module.exports = Engagement;

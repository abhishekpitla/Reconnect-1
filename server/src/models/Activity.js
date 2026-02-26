const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Activity = sequelize.define('Activity', {
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
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [1, 100] },
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    location: {
        type: DataTypes.STRING(200),
        defaultValue: '',
    },
    time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    audience: {
        type: DataTypes.ENUM('friends', 'public'),
        defaultValue: 'friends',
    },
}, {
    tableName: 'activities',
    timestamps: true,
});

module.exports = Activity;

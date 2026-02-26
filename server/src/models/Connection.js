const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Connection = sequelize.define('Connection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    requesterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted'),
        defaultValue: 'pending',
    },
}, {
    tableName: 'connections',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['requesterId', 'recipientId'] },
    ],
});

module.exports = Connection;

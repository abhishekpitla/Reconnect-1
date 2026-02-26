const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { notEmpty: true, len: [1, 50] },
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { len: [6, 255] },
    },
    profilePicture: {
        type: DataTypes.STRING(500),
        defaultValue: '',
    },
    bio: {
        type: DataTypes.STRING(300),
        defaultValue: '',
    },
}, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        },
    },
    defaultScope: {
        attributes: { exclude: ['password'] },
    },
    scopes: {
        withPassword: { attributes: {} },
    },
});

User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;

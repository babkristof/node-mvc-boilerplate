const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const EventEmitter = require('../utils/EventEmitter');

const createUser = async (userBody) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
    }
    const user = await User.create(userBody);
    //send email
    EventEmitter.emit('signup', user);
    return user;
};

const getUserByEmail = async (email) => {
    return await User.findOne({ email });
};
const getUserById = async (userId) => {
    return await User.findById(userId);
};
module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
};

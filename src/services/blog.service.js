const fs = require('fs');
const httpStatus = require('http-status');
const { CacheProcessor } = require('../background-tasks');
const { Blog } = require('../models');
const ApiError = require('../utils/ApiError');
const redisClient = require('../config/redis');

const createBlog = async (body, user) => {
    await Blog.create({ ...body, createdBy: user.id });
    await redisClient.del('recent-blogs');
};

const getBlogs = async (userId) => {
    const blogs = await Blog.find({ createdBy: userId });
    return blogs;
};

const getRecentBlogs = async () => {
    const blogs = await Blog.find()
        .sort({
            createdAt: -1,
        })
        .limit(10);
    await CacheProcessor.Queue.add('CacheJob', { blogs });
    return blogs;
};

const getReadableFileStream = async (filename) => {
    const filePath = `${__dirname}/../../uploads/${filename}`;
    if (!fs.existsSync(filePath)) {
        throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
    }
    const stream = fs.createReadStream(filePath);
    return stream;
};

module.exports = {
    createBlog,
    getBlogs,
    getRecentBlogs,
    getReadableFileStream,
};

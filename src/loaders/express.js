const express = require('express');
const blogRouter = require('../routes/blog.routes');
const authRouter = require('../routes/auth.routes');
const { errorHandler, errorConverter } = require('../middlewares/error');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const morgan = require('../config/morgan');
const { cspOptions, env } = require('../config/config');
const passport = require('passport');
const { jwtStrategy } = require('../config/passport');
const { xss } = require('express-xss-sanitizer');
const helmet = require('helmet');
const mongoSanitizte = require('express-mongo-sanitize');
const cors = require('cors');

module.exports = async (app) => {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);

    //jwt authtentication
    app.use(passport.initialize());
    passport.use('jwt', jwtStrategy);

    app.use(express.json());

    // security
    app.use(xss());
    app.use(helmet.contentSecurityPolicy({ cspOptions }));
    app.use(mongoSanitizte());

    if (env === 'production') {
        app.use(cors({ origin: 'url' }));
        app.options('*', cors({ origin: 'url' }));
    } else {
        //enabling all cors
        app.use(cors());
        app.options('*', cors());
    }

    app.use(blogRouter);
    app.use(authRouter);

    //path not found 404
    app.use((req, res, next) => {
        next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
    });

    app.use(errorConverter);
    app.use(errorHandler);
    return app;
};

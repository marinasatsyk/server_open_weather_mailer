import { Router } from "express";
import * as userController from "../conrollers/user-controller.js";
import * as weatherController from "../conrollers/weather-controller.js";
import {body,  param } from 'express-validator';
import  { authAdminMiddleware, authMiddleware } from "../middlewares/auth-middleware.js";
import pkg from 'validator';

const  router = new Router();

const {stripLow, blacklist} = pkg;

//#user crud
router.post('/registration',
    body('email').isEmail().normalizeEmail(),
    body('password').trim().isLength({min:12, max: 32}).customSanitizer(value => blacklist(value, '\\<>/\'"')),
    body('firstName')
        .trim()
        .notEmpty()
        .isString()
        .isLength({min:2, max: 32})
        .customSanitizer(value => blacklist(value, '\\<>/\'"')).escape(),

    body('lastName')
        .trim()
        .notEmpty()
        .isLength({min:2, max: 32})
        .customSanitizer(value => blacklist(value, '\\<>/\'"')).escape(),
    userController.registration);
    
router.get('/user', authMiddleware,   userController.getUser);

router.put('/user/:id/update',   authMiddleware,  
    param("id").trim().exists().isString() ,
    body('dataForUpdate.email').isEmail().normalizeEmail(),
    body('dataForUpdate.firstName')
    .trim()
    .notEmpty()
    .isString()
    .isLength({min:2, max: 32})
    .customSanitizer(value => blacklist(value, '\\<>/\'"')).escape(),

    body('dataForUpdate.lastName')
    .trim()
    .notEmpty()
    .isLength({min:2, max: 32})
    .customSanitizer(value => blacklist(value, '\\<>/\'"')).escape(),
userController.updateUser);

router.delete('/user/:id/delete',
param("id").trim().exists().isString() ,
authMiddleware, userController.deleteUser);

//authentication
router.post('/login',
        body('email').isEmail().normalizeEmail(),
        body('password').trim().isLength({min:12, max: 32}),
        userController.login);

router.get('/validateAuth', authMiddleware);

//activate account by mail
router.get('/activate/:link', userController.activate); 

//forgot password
//for generate link to reset password
 router.post('/forgot/password', 
 body('email').isEmail().normalizeEmail(),
 userController.forgotPassword); 

 //reset password
 router.patch('/reset/password/:passwordResetToken', 
        body('password').trim().isLength({min:12, max: 32}).customSanitizer(value => blacklist(value, '\\<>/\'"')),
        body('confirmPassword').trim().isLength({min:12, max: 32}).customSanitizer(value => blacklist(value, '\\<>/\'"')),
        param("passwordResetToken").trim().exists().isString(),
        userController.resetPassword);
 

//tokens, is token expired
router.get('/refresh', userController.refresh); 

//bookmarks 
router.post('/user/bookmarks',authMiddleware ,userController.updateBookmarks);
router.put('/user/bookmarks',authMiddleware,userController.updateActiveBookmark);
router.delete('/user/bookmarks',authMiddleware,userController.deleteBookmark);

//weather
router.post('/weather/current',authMiddleware, weatherController.currentWeather);
router.post('/weather/forecast/hourly',authMiddleware, weatherController.forecastWeatherHourly);
router.post('/weather/forecast/daily',authMiddleware, weatherController.forecastWeatherDaily);
router.post('/weather/pollution',authMiddleware, weatherController.pollutionWeather);

//history
router.post('/weather/history',authMiddleware,
    body('startDate')
        .trim()
        .notEmpty()
        .isNumeric()
        .custom(value =>{ 
            const date = new Date(value * 1000); // Convert  timestamp in milliseconds
            return !isNaN(date.getTime());
        })
        .withMessage('The field timestamp isn\'t  timestamp valid.'),
    body('endDate')
        .trim()
        .notEmpty()
        .isNumeric()
        .custom(value =>{ 
            const date = new Date(value * 1000); // Convert  timestamp in milliseconds
            return !isNaN(date.getTime());
        })
        .withMessage('The field timestamp isn\'t  timestamp valid.'),
    body('cityId')
        .trim()
        .notEmpty()
        .isString()
        .withMessage('The field city id is not valid.'),
 weatherController.historyWeather);

 router.post('/weather/history/available', body('cityId')
    .trim()   
    .notEmpty()
    .isString()
    .withMessage('The field city id is not valid.'), weatherController.historyAvailable);


//admin routes
router.get('/admin/users', authAdminMiddleware, userController.getAllUsers);


router.post('/admin/user/create',
    body('email').isEmail().normalizeEmail(),
    body('password').trim().isLength({min:12, max: 32}).isLength({min:12, max: 32}).customSanitizer(value => blacklist(value, '\\<>/\'"')),
    body('firstName')
        .trim()
        .notEmpty()
        .isString()
        .isLength({min:2, max: 32})
        .customSanitizer(value => blacklist(value, '\\<>?:/\'"')).escape(),

    body('lastName')
        .trim()
        .notEmpty()
        .isLength({min:2, max: 32})
        .customSanitizer(value => blacklist(value, '\\<>?:/\'"')).escape(),
    authAdminMiddleware, 
    userController.create);

router.get('/admin/user/:id', authMiddleware,   userController.getUser);


//TODO admin functionality for logout any user
router.post('/logout', userController.logout);

export default router;
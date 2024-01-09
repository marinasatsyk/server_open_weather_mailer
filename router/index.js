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
    body('password').isLength({min:6, max: 32}).trim(),
    body('firstName')
        .notEmpty()
        .isString()
        .isLength({min:2, max: 32})
        .trim().customSanitizer(value => blacklist(value, '<>&?:/"')).escape(),

    body('lastName')
        .notEmpty()
        .isLength({min:2, max: 32})
        .trim().customSanitizer(value => blacklist(value, '<>&?:/"')).escape(),
    userController.registration);
    
router.get('/user', authMiddleware,   userController.getUser);

router.put('/user/:id/update',   authMiddleware,  
    param("id").exists().isString().trim() ,
    body('dataForUpdate.email').isEmail().normalizeEmail(),
    body('dataForUpdate.firstName')
    .notEmpty()
    .isString()
    .isLength({min:2, max: 32})
    .trim().customSanitizer(value => blacklist(value, '<>&?:/"')).escape(),

    body('dataForUpdate.lastName')
    .notEmpty()
    .isLength({min:2, max: 32})
    .trim().customSanitizer(value => blacklist(value, '<>&?:/"')).escape(),
userController.updateUser);

router.delete('/user/:id/delete',
param("id").exists().isString().trim() ,
authMiddleware, userController.deleteUser);

//authentication
router.post('/login',
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({min:6, max: 32}).trim(),
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
        body('password').isLength({min:6, max: 32}).trim(),
        body('confirmPassword').isLength({min:6, max: 32}).trim(),
        param("passwordResetToken").exists().isString(),
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
        .notEmpty()
        .isNumeric()
        .trim()
        .custom(value =>{ 
            const date = new Date(value * 1000); // Convert  timestamp in milliseconds
            return !isNaN(date.getTime());
        })
        .withMessage('The field timestamp isn\'t  timestamp valid.'),
    body('endDate')
        .notEmpty()
        .isNumeric()
        .trim()
        .custom(value =>{ 
            const date = new Date(value * 1000); // Convert  timestamp in milliseconds
            return !isNaN(date.getTime());
        })
        .withMessage('The field timestamp isn\'t  timestamp valid.'),
    body('cityId')
        .notEmpty()
        .isString()
        .trim()
        .withMessage('The field city id is not valid.'),
 weatherController.historyWeather);

 router.post('/weather/history/available', body('cityId')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('The field city id is not valid.'), weatherController.historyAvailable);


//admin routes
router.get('/admin/users', authAdminMiddleware, userController.getAllUsers);


router.post('/admin/user/create',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min:6, max: 32}).trim(),
    body('firstName')
        .notEmpty()
        .isString()
        .isLength({min:2, max: 32})
        .trim().customSanitizer(value => blacklist(value, '<>&?:/"')).escape(),

    body('lastName')
        .notEmpty()
        .isLength({min:2, max: 32})
        .trim().customSanitizer(value => blacklist(value, '<>&?:/"')).escape(),
    authAdminMiddleware, 
    userController.create);

router.get('/admin/user/:id', authMiddleware,   userController.getUser);


//TODO admin functionality for logout any user
router.post('/logout', userController.logout);

export default router;
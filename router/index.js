import { Router } from "express";
import * as userController from "../conrollers/user-controller.js";
import * as weatherController from "../conrollers/weather-controller.js";
import {body, check, param } from 'express-validator';
import  { authAdminMiddleware, authMiddleware } from "../middlewares/auth-middleware.js";
import pkg from 'validator';

const  router = new Router();

const {stripLow, blacklist} = pkg;

//#user crud
router.post('/registration',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min:2, max: 32}).trim(),
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

router.put('/user/:id/update', 
authMiddleware,  
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

router.delete('/user/:id/delete', authMiddleware, userController.deleteUser);
    
//authentication
router.post('/login', userController.login);
router.get('/validateAuth', authMiddleware);

router.get('/activate/:link', userController.activate); //for activate account from mail
router.get('/refresh', userController.refresh); //is token expired
router.post('/logout', userController.logout);
//#todo
router.post('/logoutAll', userController.logoutAll); //delete all refreshTokens

//#todo
// router.post('/user/bookmarks', 
//         authMiddleware,
//         body('name').isString().trim().escape(),
//         body('lat').isNumeric().escape(),
//         body('lon').isNumeric().escape(),
//         body('local_names').isObject,
//         body('state').isString().trim().escape(),
//         body('country').isString().trim().escape(),
//         userController.updateBookmarks)

router.post('/user/bookmarks',authMiddleware,userController.updateBookmarks);
router.put('/user/bookmarks',authMiddleware,userController.updateActiveBookmark);
router.delete('/user/bookmarks',authMiddleware,userController.deleteBookmark);



//weather
router.post('/weather/current',authMiddleware, weatherController.currentWeather);
router.post('/weather/forecast/hourly',authMiddleware, weatherController.forecastWeatherHourly);
router.post('/weather/forecast/daily',authMiddleware, weatherController.forecastWeatherDaily);
router.post('/weather/pollution',authMiddleware, weatherController.pollutionWeather);


router.post('/weather/history',authMiddleware,
body('startDate')
    .notEmpty()
    .isNumeric()
    .trim()
    .custom(value =>{ 
        const date = new Date(value * 1000); // Convertir le timestamp en millisecondes
        return !isNaN(date.getTime());
    })
    .withMessage('The field timestamp isn\'t  timestamp valid.'),
body('endDate')
    .notEmpty()
    .isNumeric()
    .trim()
    .custom(value =>{ 
        const date = new Date(value * 1000); // Convertir le timestamp en millisecondes
        return !isNaN(date.getTime());
    })
    .withMessage('The field timestamp isn\'t  timestamp valid.'),
body('cityId')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('The field city id is not valid.'),
 weatherController.historyWeather);

//#todo
router.get('/forecast-climat',authMiddleware, weatherController.climatWeather);


//access admin routes
router.get('/admin/users', authAdminMiddleware, userController.getAllUsers);

router.post('/admin/user/create',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min:2, max: 32}).trim(),
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


// router.post('admin/user/edit', authAdminMiddleware, userController.edit);
// router.post('admin/user/deconnect', authAdminMiddleware, userController.deconnect);
// router.delete('admin/user', authAdminMiddleware, userController.delete);



export default router;
import { Router } from "express";
import * as userController from "../conrollers/user-controller.js";
import * as weatherController from "../conrollers/weather-controller.js";
import {body, check} from 'express-validator';
import  { authAdminMiddleware, authMiddleware } from "../middlewares/auth-middleware.js";

const  router = new Router();

//authentication
router.post('/registration',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min:3, max: 32}).trim().escape(),
    userController.registration);

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
//         check('name').isString().trim().escape(),
//         check('lat').isNumeric().escape(),
//         check('lon').isNumeric().escape(),
//         check('local_names').isObject,
//         check('state').isString().trim().escape(),
//         check('country').isString().trim().escape(),
//         userController.updateBookmarks)

router.post('/user/bookmarks',authMiddleware,userController.updateBookmarks);
router.put('/user/bookmarks',authMiddleware,userController.updateActiveBookmark);
router.delete('/user/bookmarks',authMiddleware,userController.deleteBookmark);

router.put('/user/:id', authMiddleware,   userController.update);

router.get('/user', authMiddleware,   userController.getUser);

//weather
router.post('/weather/current',authMiddleware, weatherController.currentWeather);
router.post('/weather/forecast/hourly',authMiddleware, weatherController.forecastWeatherHourly);
router.post('/weather/forecast/daily',authMiddleware, weatherController.forecastWeatherDaily);
router.post('/weather/pollution',authMiddleware, weatherController.pollutionWeather);

//#todo
router.post('/weather/history',authMiddleware, weatherController.historyWeather);


router.get('/forecast-climat',authMiddleware, weatherController.climatWeather);


//access admin routes
router.get('admin/users', authAdminMiddleware, userController.getAllUsers);
// router.post('admin/user/edit', authAdminMiddleware, userController.edit);
// router.post('admin/user/deconnect', authAdminMiddleware, userController.deconnect);
// router.delete('admin/user', authAdminMiddleware, userController.delete);



export default router;
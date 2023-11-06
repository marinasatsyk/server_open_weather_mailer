import { Router } from "express";
import * as userController from "../conrollers/user-controller.js";
import * as weatherController from "../conrollers/weather-controller.js";
import {body} from 'express-validator';
import  { authAdminMiddleware, authMiddleware } from "../middlewares/auth-middleware.js";

  const  router = new Router();

//authentication
router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min:3, max: 32}),
    userController.registration);

router.post('/login', userController.login);

router.get('/activate/:link', userController.activate); //for activate account from mail
router.get('/refresh', userController.refresh); //is token expired
router.post('/logout', userController.logout);
//#todo
router.post('/logoutAll', userController.logoutAll); //delete all refreshTokens

//#todo
router.put('/user/:id', authMiddleware,   userController.update);
router.get('/user/:id', authMiddleware,   userController.dashboard);


//weather
//#todo
router.get('/user/city/historyweather',authMiddleware, weatherController.historyWeather);
router.get('/current-weather',authMiddleware, weatherController.currentWeather);
router.get('/forecast-weather',authMiddleware, weatherController.forecastWeather);
router.get('/forecast-climat',authMiddleware, weatherController.climatWeather);

//access admin routes
router.get('/users', authAdminMiddleware, userController.getUsers);

//users routes



export default router;
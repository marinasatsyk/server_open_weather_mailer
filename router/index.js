import { Router } from "express";
import * as userController from "../conrollers/user-controller.js";
import {body} from 'express-validator';
import authMiddleware from "../middlewares/auth-middleware.js";

  const  router = new Router();


router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min:3, max: 32}),
    userController.registration);

router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.get('/activate/:link', userController.activate); //for activate account from mail
router.get('/refresh', userController.refresh); //is token expired

router.get('/users', authMiddleware, userController.getUsers)


export default router;
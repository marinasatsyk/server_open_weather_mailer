import { Router } from "express";
import * as userController from "../conrollers/user-controller.js";
  const  router = new Router();


router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.get('/activate/:link', userController.activate); //for activate account from mail
router.get('/refresh', userController.refresh); //is token expired

router.get('/users', userController.getUsers)


export default router;
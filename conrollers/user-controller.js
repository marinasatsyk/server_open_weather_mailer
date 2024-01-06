import { ApiError } from '../exceptions/api-error.js';
import UserModel from '../models/user-model.js';
import * as  userService from '../service/user-service.js';
import { validationResult, param  } from 'express-validator';
import * as helpers from '../helpers/helpers.js';
import mongoose from 'mongoose';


//user CRUD

//create
export const  registration =  async(req, res, next) =>  {
    try{
        const errors = validationResult(req); //result from express validators
        
        if(!errors.isEmpty()){
            return next(ApiError.BadRequest('Validation error', errors.array()))
        }
        
        const {email, password, firstName, lastName} = req.body;

        const userData = await userService.registration(req, email, password, firstName, lastName);
        
        //for clientSide cookies refreshToken
        res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 1000, 
            httpOnly: true,          
            sameSite: 'None', 
            secure: true
        }) 
        return res.json(userData); //sent in client side json object
    }catch(err){
        next(err)
    }
}

//read

export const getUser =  async(req, res, next) =>  {
    const idHost = helpers.getId(req, res, next);
    const {id : userId} = req.params;
    
    try{
        const userHost =  await userService.getUser(idHost);
        const isAdmin = userHost.role === "root" ? true : false;
        if(!isAdmin || isAdmin&&!userId){
            return res.json(userHost);
        }

        if(idHost !== userId && !isAdmin){
                return next(ApiError.BadRequest('Unothorized to get other user data'))
        }

        const userData = await userService.getUser(userId);
        return res.json(userData); //sent in client side json object

    }catch(err){
        next(err) //we use error middleware 
    }
}


//update user
export const updateUser =  async(req, res, next) =>  {
    const idHost = helpers.getId(req, res, next);
    let {id : userId} = req.params;

    try{
        const userHost =  await userService.getUser(idHost);
        const errors = validationResult(req); //result from express validators
        
        if(!errors.isEmpty()){
            return next(ApiError.BadRequest('Validation error', errors.array()))
        }

        const { email, firstName, lastName, role, isActivated} = req.body.dataForUpdate;
       
        const isAdmin = userHost.role === "root" ? true : false;

        userId =  isAdmin ? userId : idHost;

        const userUpdatedData =  await userService.update(isAdmin, userId, email, firstName, lastName, role, isActivated);
       
        return res.json(userUpdatedData); 
    }catch(err){
        next(err)
    }
 }
 
 //delete user
export const deleteUser =  async(req, res, next) =>  {

    let {id : userId } = req.params;

    const idHost = helpers.getId(req, res, next);

    try{  
        const userHost =  await userService.getUser(idHost);
        const isAdmin = userHost.role === "root" ? true : false;
        
        if(!isAdmin){
            userId = idHost;
        }
        const deleteUser = await userService.deleteUser(userId);
        return res.json({ success: true, message: 'User was deleted successefully', deletedUser: deleteUser });
    }catch(err){
     next(err) 
    }
}
 

export const login =  async(req, res, next) =>  {
    const errors = validationResult(req); //result from express validators
        
    if(!errors.isEmpty()){
        return next(ApiError.BadRequest('Validation error', errors.array()))
    }


    try{
        const {email, password} = req.body;


        const userData = await userService.login(email, password);
        
        res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 1000, 
            httpOnly: true,
            sameSite: 'None', 
            secure: true
        }) //for clientSide cookies refreshToken
        
        return res.json(userData); 

    }catch(err){
        //we use error middleware 
        next(err) 
    }
}


export const logout =  async(req, res, next) =>  {
    try{
        const {refreshToken} = req.cookies;
        const token = await userService.logout(refreshToken)

        res.clearCookie('refreshToken');
        return res.json(token);

    }catch(err){
        next(err)
    }
}

export const activate =  async(req, res, next) =>  {
    try{
        const activationLink = req.params.link;
        await userService.activate(activationLink);

        //TODO change for prod redirction of client side
        return res.redirect(process.env.CLIENT_URL); 
    }catch(err){
        next(err)
    }
}

export const forgotPassword =  async(req, res, next) =>  {
    const errors = validationResult(req); //result from express validators
    if(!errors.isEmpty()){
        return next(ApiError.BadRequest('Validation error', errors.array()))
    }

    const {email} = req.body;
    if(!email){
        return next(ApiError.BadRequest('Email missing'))
    }

    try{
       await userService.forgotPassword(req, email);
      
       res.status(200).json({
        status: "success",
        message: 'password reset link send to user email'
       })
    }catch(err){
        next(err)
    }
}

export const resetPassword =  async(req, res, next) =>  {
    const errors = validationResult(req); //result from express validators
   
    if(!errors.isEmpty()){
        return next(ApiError.BadRequest('Validation error', errors.array()))
    }
    const { password, confirmPassword} = req.body;
    const {passwordResetToken} = req.params;

    if(!passwordResetToken || ! password || !confirmPassword){
        return next(ApiError.BadRequest('Incomplete data'))
    }

    try{
        await userService.resetPassword(req, passwordResetToken, password, confirmPassword);
       
        res.status(200).json({
         status: "success",
         message: 'password was reseted'
        })
    }catch(err){
        next(err)
    }
}


/**Token */
export const refresh =  async(req, res, next) =>  {
    try{
        //we get refresh from cookies;
        const {refreshToken} = req.cookies;
        console.log("❗refreshToken",refreshToken)
        //here we get user Data + new access token
        const userData = await userService.refreshToken(refreshToken);
       
        //we send the old refresh token
       
        res.cookie('refreshToken', refreshToken, {
        // res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 1000, 
            httpOnly: true,
            sameSite: 'None', // Ajout de SameSite=None
            secure: true
        }) //for clientSide cookies refreshToken
        console.log("refreshToken", refreshToken)
        //sent in client side json object
        return res.json(userData); 
    }catch(err){
        next(err)
    }
}


/**Bookmarks*/

//create
export const updateBookmarks =  async(req, res, next) =>  {
    /** this service create one bookmark
     * create city if it doesn't exist yet
     * get and record hiscorical data 
     * update user information
     */

   //get one user
   const{city, isHistory, isActive } = req.body;
   const idUser = helpers.getId(req, res, next);
   try{
        const userDoc = await UserModel.findById(idUser);
        if(!userDoc){
            throw ApiError.BadRequest('User doesn\'t found');
        }
        const updatedUser = await userService.updateBookmarks(userDoc, city, isHistory, isActive);
        return res.json(updatedUser);
   }catch(err){
    next(err)
   }
}

//update one bookmark
export const updateActiveBookmark =  async(req, res, next) =>  {
   const{cityId, isHistory } = req.body;
   const idUser = helpers.getId(req, res, next);

   try{
    const updatedUser =  await userService.updateActiveBookmark(idUser, cityId, isHistory);
    return res.json(updatedUser);
   }catch(err){
    next(err) 
   }
}

//delete
export const deleteBookmark =  async(req, res, next) =>  {
   const{cityId } = req.body;
   const idUser = helpers.getId(req, res, next);
   try{
    const updatedUser = await userService.deleteBookmark(idUser, cityId)
    return res.json(updatedUser);
   }catch(err){
    next(err) 
   }
}


/**Admin*/
export const getAllUsers =  async(req, res, next) =>  {
    try{
        const users = await userService.getAllUsers();
        return res.json(users)
    }catch(err){
        next(err)
    }
}

export const  create =  async(req, res, next) =>  {
    try{
        const errors = validationResult(req); //result from express validators
        if(!errors.isEmpty()){
            return next(ApiError.BadRequest('Validation error', errors.array()))
        }
        const {email, password, firstName, lastName, role} = req.body;
        const userData = await userService.registration(req, email, password, firstName, lastName, role, true);
        return res.json(userData); //sent in client side json object
    }catch(err){
        next(err)
    }
}


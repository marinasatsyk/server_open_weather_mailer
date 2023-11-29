import { ApiError } from '../exceptions/api-error.js';
import UserModel from '../models/user-model.js';
import * as  userService from '../service/user-service.js';
import { validationResult } from 'express-validator';
import * as helpers from '../helpers/helpers.js';
import mongoose from 'mongoose';

export const  registration =  async(req, res, next) =>  {
    try{
        const errors = validationResult(req); //result from express validators
        
        if(!errors.isEmpty()){
            return next(ApiError.BadRequest('Validation error', errors.array()))
        }
        
        const {email, password, firstName, lastName} = req.body;

        const userData = await userService.registration(email, password, firstName, lastName);
        
        //for clientSide cookies refreshToken
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true}) 
        return res.json(userData); //sent in client side json object
    }catch(err){
        next(err)
    }
}

export const login =  async(req, res, next) =>  {
    try{
        const {email, password} = req.body;
        const userData = await userService.login(email, password);
        
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true}) //for clientSide cookies refreshToken
        
        // setTimeout(() => {
        // }, 300)
        
        return res.json(userData); //sent in client side json object

    }catch(err){
        next(err) //we use error middleware 
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
        return res.redirect(process.env.CLIENT_URL); //redirction of client side
    }catch(err){
        next(err)
    }
}


export const refresh =  async(req, res, next) =>  {
    try{
        const {refreshToken} = req.cookies;
        console.log('refreshToken', refreshToken);
        
        const userData = await userService.refreshToken(refreshToken);
        console.log(userData)
        
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true}) //for clientSide cookies refreshToken
        return res.json(userData); //sent in client side json object

    }catch(err){
        next(err)
    }
}

export const getUser =  async(req, res, next) =>  {
    try{
        const id = helpers.getId(req, res, next);
        const userData = await userService.getUser(id)
        return res.json(userData); //sent in client side json object

    }catch(err){
        next(err) //we use error middleware 
    }
}

/**Bookmarks
 */

//create
export const updateBookmarks =  async(req, res, next) =>  {
    /** this service create one bookmark
     * create city if there is not
     * get hiscorical data 
     * update user information
     */

    console.log("we update bookmarks!!!")
   //get one user
   const{city, isHistory, isActive } = req.body;
   const idUser = helpers.getId(req, res, next);
   try{
        const userDoc = await UserModel.findById(idUser);
        
        if(!userDoc){
            throw ApiError.BadRequest('User doesn\'t found');
        }

        const updatedUser = await userService.updateBookmarks(userDoc, city, isHistory, isActive);
        
        console.log("controller reponse ====> ", updatedUser)
        return res.json(updatedUser);
   }catch(err){
    next(err)
   }
}

//update
export const updateActiveBookmark =  async(req, res, next) =>  {
   const{cityId } = req.body;
   const idUser = helpers.getId(req, res, next);

   try{
    const updatedUser =  await userService.updateActiveBookmark(idUser, cityId);
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




export const getUsers =  async(req, res, next) =>  {
    try{
        const users = await userService.getAllUsers();
        return res.json(users)
    }catch(err){
        next(err)
    }
}


export const logoutAll =  async(req, res, next) =>  {
    try{
        // const users = await userService.getAllUsers();
        // return res.json(users)

    }catch(err){
        next(err)
    }
}
export const update =  async(req, res, next) =>  {
    try{
        
        // let fields = 
        // const users = await userService.getAllUsers();
        // return res.json(users)

    }catch(err){
        next(err)
    }
} 

export const dashboard =  async(req, res, next) =>  {
    try{
        // const users = await userService.getAllUsers();
        // return res.json(users)

    }catch(err){
        next(err)
    }
}



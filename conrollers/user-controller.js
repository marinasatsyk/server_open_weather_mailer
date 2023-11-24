import { ApiError } from '../exceptions/api-error.js';
import UserModel from '../models/user-model.js';
import * as  userService from '../service/user-service.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
   
export const  registration =  async(req, res, next) =>  {
    try{
        const errors = validationResult(req); //result from express validators
        
        if(!errors.isEmpty()){
            return next(ApiError.BadRequest('Validation error', errors.array()))
        }
        
        const {email, password, firstName, lastName} = req.body;

        const userData = await userService.registration(email, password, firstName, lastName);
        
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true}) //for clientSide cookies refreshToken
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


export const refresh=  async(req, res, next) =>  {
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
        const authorizationHeader = req.headers.authorization;
        console.log('authMiddleware', authorizationHeader)
        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError())
        }
        const accessToken = authorizationHeader.split(' ')[1];
      const decode = jwt.decode(accessToken);
        console.log("HELLO  token", decode)
        const id = decode.id;
        const userData = await userService.getUser(id)
        return res.json(userData); //sent in client side json object

    }catch(err){
        next(err) //we use error middleware 
    }
}

export const updateBookmarks =  async(req, res, next) =>  {
   //get one user
   const {id} = req.params;
   const{city, isFollowingHistory, isActive} = req.body;

   try{
    const updatedUser = await userService.updateBookmarks(id, city, isFollowingHistory, isActive)


   }catch(err){
    next(err) //we use error middleware 
   }
   
        //    //get bookmarks
        //    let bookmarks = userData.bookmarks;

        //    //get oneCity 
        //    let candidatCity = await cityService.getCity(lat, lon);

        //    if(!candidatCity){
        //     //create one
        //    }

        

        //update bookmarks OR  createCity+update bookmars

        //   const cityToFollow = req.body.city;
        // // name, lat, lon, local_names, state, country

        //     try{
        //         const errors = validationResult(req); //result from express validators


                
        //         return res.json(users)

        //     }catch(err){
        //         next(err)
        //     }
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



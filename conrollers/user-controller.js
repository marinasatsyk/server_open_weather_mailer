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

        const userData = await userService.registration(email, password, firstName, lastName);
        
        //for clientSide cookies refreshToken
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true}) 
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
        
        console.log("new controller check:", 
        "isAdmin", isAdmin,"userId", userId, 
        "email", email, 
        "firstName",  firstName, 
        "lastName", lastName, 
        "role", role,
        "isActivated", isActivated,
        "idHost",idHost)
        // console.log("new controller check:", 
        // "isAdmin", isAdmin,"userId", userId, 
        // "email", email, 
        // "firstName",  firstName, 
        // "lastName", lastName, 
        // "role", role,
        // "isActivated", isActivated)

        // if(String(idHost) !== String(userId) && !isAdmin){
        //     console.log("idHost", String(idHost), "(userId)", String(userId))
        //     return next(ApiError.BadRequest('Unothorized to change other user data'))
        // }

        userId =  isAdmin ? userId : idHost;

        console.log("userId", userId, idHost)

        const userUpdatedData =  await userService.update(isAdmin, userId, email, firstName, lastName, role, isActivated);

         return res.json(userUpdatedData); //sent in client side json object
    }catch(err){
        next(err)
    }
 }
 
 //delete user
export const deleteUser =  async(req, res, next) =>  {

    let {id : userId } = req.params;

    console.log("userId", userId, req.params)
    const idHost = helpers.getId(req, res, next);
    console.log("idHost", idHost)

    try{  
        const userHost =  await userService.getUser(idHost);
        const isAdmin = userHost.role === "root" ? true : false;
        console.log("isAdmin", isAdmin)
        
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
        console.log('❤️refreshToken ===START refresh***=== /refresh', refreshToken);
        
        const userData = await userService.refreshToken(refreshToken);

        console.log("====****continue in controller refresh**====", "old refresh:", refreshToken, "new refresh:", userData.refreshToken)
        
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true}) //for clientSide cookies refreshToken
       
        return res.json(userData); //sent in client side json object

    }catch(err){
        next(err)
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

//update one bookmark
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



/**admin  */
export const getAllUsers =  async(req, res, next) =>  {
    try{
        const users = await userService.getAllUsers();
        console.log("users", users)
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
        const userData = await userService.registration(email, password, firstName, lastName, role, true);
        return res.json(userData); //sent in client side json object
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
// export const update =  async(req, res, next) =>  {
//     try{
        
//         // let fields = 
//         // const users = await userService.getAllUsers();
//         // return res.json(users)

//     }catch(err){
//         next(err)
//     }
// } 

export const dashboard =  async(req, res, next) =>  {
    try{
        // const users = await userService.getAllUsers();
        // return res.json(users)

    }catch(err){
        next(err)
    }
}



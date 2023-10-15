import * as  userService from '../service/user-service.js';

   
    export const  registration =  async(req, res, next) =>  {
        try{
            const {email, password, firstName, lastName} = req.body;
            const userData = await userService.registration(email, password, firstName, lastName);
            
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true}) //for clientSide cookies refreshToken
            return res.json(userData); //sent in client side json object
        }catch(err){
           console.error(err) 
           res.send(err.message)
        }
    }

    export const login=  async(req, res, next) =>  {
        try{

        }catch(err){

        }
    }

    export const logout=  async(req, res, next) =>  {
        try{

        }catch(err){

        }
    }

    export const activate=  async(req, res, next) =>  {
        try{

        }catch(err){

        }
    }

    export const refresh=  async(req, res, next) =>  {
        try{

        }catch(err){

        }
    }

    export const getUsers=  async(req, res, next) =>  {
        try{
            res.json(['123', '456'])
        }catch(err){

        }
    }



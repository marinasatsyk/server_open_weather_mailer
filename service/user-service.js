import UserModel from "../models/user-model.js";
import CityModel from "../models/city-model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import MailService from './mail-service.js';
import * as CityServise from './city-service.js';
import * as tokenService from './token-service.js';
import UserDto from '../dtos/user-dto.js';
import { ApiError } from "../exceptions/api-error.js";
import UserFullDto from "../dtos/user-full-dto.js";
import { historyDataCreate } from "./weather-service.js";

const SALTROUNDS = 10;
const {SERVER_HOST, SERVER_PORT} = process.env;


//CREATE
export const registration = async (email, password, firstName, lastName, role = 'user', isAdminCreate = false) => {
    console.log(email, password, firstName, lastName, role);
    const candidate = await UserModel.findOne({email})
    if(candidate){
        throw ApiError.BadRequest('email exists');  
    }
   
    //crypt password 
    const hash = await bcrypt.hash(password, SALTROUNDS);
    //generate activation link
    const activationLink = uuidv4();
    
    //create user 
    const userDoc = await  UserModel.create({
        email,
        password: hash,
        firstName,
        lastName,
        createdDateTime: new Date(),
        activationLink, 
        role
    }) 
    //send confirm mail+ activation link
    const mailService = new MailService();
    await mailService.sendActivationMail(email, `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/activate/${activationLink}`)

    // await  mailService.sendActivationMail(email, activationLink);
    const userDto = new UserDto(userDoc); //id, email, isActivated

    //generate tokens
    const tokens = await tokenService.generateToken({...userDto});
   
    console.log('😍😍', tokens)

    await tokenService.saveToken(userDto.id,  tokens.refreshToken)

    console.log( userDto )

   return{ ...tokens, user:isAdminCreate ?userDoc : userDto }
}



export const activate = async (activationLink) => {
    const userDoc = await UserModel.findOne({activationLink});
    if(!userDoc){
        throw ApiError.BadRequest('Error activation link')
    }

    userDoc.isActivated = true;

    await userDoc.save();
}

export const login = async (email, password) => {
    console.log("login")
    const userDoc = await UserModel.findOne({email}).populate('bookmarks.city');
    if(!userDoc){
        throw ApiError.BadRequest('User doesn\'t found')
    }
    const compare = await bcrypt.compare(password, userDoc.password);
    console.log("compare", compare)
    
    if(!compare){
        console.log("no compaire")
        throw ApiError.BadRequest('Wrong username or password')
    }

    //verif if email is activated
    if(!userDoc.isActivated){
        console.log("no activated")
        throw ApiError.BadRequest('Email was not activated')
    }

    const userFullDto = new UserFullDto(userDoc);
    const userDto = new UserDto(userDoc);
    console.log("userFullDtosuivant", userFullDto)
    const tokens = await tokenService.generateToken({...userDto});
    console.log('😍😍 from login', tokens)

    await tokenService.saveToken(userDto.id,  tokens.refreshToken)

    console.log( 'from login userDto', userFullDto )
     return{ ...tokens, user: userFullDto }
   // return{ ...tokens }
}

//UPDATE
export const update = async(isAdmin, userId, email,  firstName, lastName, role, isActivated)=> {
   
    console.log("new data:", 
    "isAdmin", isAdmin,"userId", userId, 
    "email", email, 
    "firstName",  firstName, 
    "lastName", lastName, 
    "role", role,
    "isActivated", isActivated)
    //find user to update
    const userDoc = await UserModel.findById(userId);
    if(!userDoc){
      throw ApiError.BadRequest('User doesn\'t found')
    }
    
    console.log("*****update", userDoc)

    //verification email exists if change email
    if(userDoc.email !== email){
        const candidate = await UserModel.findOne({email})
        if(candidate){
            throw ApiError.BadRequest('email exists');  
        }
        console.log("email change", email)
    }

    //only admin can update role&activation status



    // const dataToUpdate = isAdmin 
    // ? {
    //     email,  
    //     firstName, 
    //     lastName, 
    //     role, 
    //     isActivated
    // }
    // : {
    //     email,  
    //     firstName, 
    //     lastName, 
    //     isActivated: userDoc.email !== email ? false : userDoc.isActivated
    // }

    
    // const updatedUser = await UserModel.findByIdAndUpdate(userId, dataToUpdate, { new: true });

    const dataToUpdate = {};

    // Mettre à jour uniquement les champs présents dans la requête
    if (email) dataToUpdate.email = email;
    if (firstName) dataToUpdate.firstName = firstName;
    if (lastName) dataToUpdate.lastName = lastName;
    if (isAdmin) dataToUpdate.role = role;
    if (isAdmin) dataToUpdate.isActivated = isActivated;
    if(!isAdmin && userDoc.email !== email) dataToUpdate.isActivated =  false;
    
    // Si aucun champ à mettre à jour, ne rien faire
    if (Object.keys(dataToUpdate).length === 0) {
        console.log("Aucun champ à mettre à jour");
        return userDoc;
    }
    console.log("dataToUpdate", dataToUpdate);
    const updatedUser = await UserModel.findByIdAndUpdate(userId, dataToUpdate, { new: true });
    console.log("updated User", updatedUser);


    //if we change email and admin doesn't activate new email wi send
    if(isAdmin && userDoc.email !== email && !isActivated || !isAdmin && userDoc.email !== email){
        const activationLink = uuidv4();
        //send confirm mail+ activation link
        const mailService = new MailService();
        await mailService.sendActivationMail(email, `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/activate/${activationLink}`)
    }

    
    return updatedUser;
}


//DELETE
export const deleteUser = async (idUser) => {
    console.log("deleteUser", idUser)
    const userDoc = await UserModel.findById(idUser);

    console.log('user finded fo delete', userDoc)
    
    if(!userDoc){
        throw ApiError.BadRequest('User doesn\'t found');
    }

    const deletedUser =  UserModel.findByIdAndDelete(idUser);
    console.log("deletedUser", deletedUser);
   
   return deletedUser
}





export const getUser = async (id) => {
    console.log('==========================>we have acces to getUser')
    const userDoc = await UserModel.findById(id).populate('bookmarks.city');
    if(!userDoc){
      throw ApiError.BadRequest('User doesn\'t found')
    }
    
    const userDto = new UserFullDto(userDoc);
    return userDto;
}


export const logout = async (refreshToken) => {
    const token  = await tokenService.removeToken(refreshToken);
    return token;
}

export const refreshToken = async (refreshToken) => {
    
    if(!refreshToken){
        console.log('????no  refresh token')
        throw ApiError.UnauthorizedError(); //user doesn't have the token
    }

    const userData = await tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    console.log('❤️❤️❤️!!!!!!!!===> user service refreshToken', 
    "refresh token from front", refreshToken,  
    "validate refresh Token", userData,
    "token found in db", tokenFromDb);


    if(!userData || !tokenFromDb){
        throw ApiError.UnauthorizedError(); //user doesn't have the token
    }

   
    const user = await UserModel.findById(userData.id) //user's info can change, so we use the current info db

    const userDto = new UserDto(user);
    const userFullDto = new UserFullDto(user);

    //??we generate both???
    const tokens = await tokenService.generateToken({...userDto});
    console.log('😍😍 from refresh', tokens)

    await tokenService.saveToken(userDto.id,  tokens.refreshToken)

    console.log( 'from refresh userDto', userFullDto )
    return{ ...tokens, user: userFullDto }
}


//Bookmarks


//create
export const updateBookmarks = async (userDoc, city, isHistory, isActive) => {
    console.log("SERVICE in updateBookmarks ")
    
    //history part!!!!
    const cityDoc = await CityServise.findOrCreateCity(city, isHistory);
        console.log("city info after creation or search", cityDoc)
    if(!cityDoc){
        throw ApiError.apply('Error of city creation')
    }

    console.log('NEW CITY id stringify', String(cityDoc._id))

    const idsBokmarks = userDoc.bookmarks.map((bookmark) => {
        return String(bookmark.city._id);
    })

    //verify if city doesn't exists yet
   const isFound = idsBokmarks.includes(String(cityDoc._id));
   
   //if no bookmarks the first will by active

   if(!idsBokmarks.length){
        isActive = true;
    }


   if(!isFound){
        const newBookmark = {
                city: cityDoc._id,
                isFollowHistory: isHistory,
                isActive 
        }

        //changecitybyDefault if isActive true
        if(isActive){
            userDoc.bookmarks .forEach(bookmark => {
                bookmark.isActive = false;
            });
        }
        userDoc.bookmarks.push(newBookmark);
        await userDoc.save();
    }

   const updatedUser = await UserModel.findById(userDoc._id).populate('bookmarks.city');

   return updatedUser;
}

//update
export const updateActiveBookmark = async (idUser, cityId, isHistory) => {

    const userDoc = await UserModel.findById(idUser);
    if(!userDoc){
        throw ApiError.BadRequest('User doesn\'t found');
    }
   userDoc.bookmarks.forEach(bookmark => {
       if (String(bookmark.city) === cityId){
            bookmark.isActive = true;
            if(isHistory){bookmark.isFollowHistory = isHistory}
       }else{
        bookmark.isActive = false;
       }
    });

    if(isHistory){
        const candidateCity = await CityModel.findById(cityId);  

        if(candidateCity){
            console.log('UPDATED HISTORY status candidateCity exists', candidateCity)
            
            //we search and save history
            await historyDataCreate(candidateCity._id, candidateCity.lat, candidateCity.lon);
            //we change status of history of current city
            candidateCity.isHistory =  true;
            //we save candidate changes
            await candidateCity.save();
        };
    }
    await userDoc.save();
    const updatedUser = await UserModel.findById(idUser).populate('bookmarks.city');

    return updatedUser;
}





export const deleteBookmark = async (idUser, cityId) => {
    const userDoc = await UserModel.findById(idUser);
    console.log('userDoc', userDoc)
    if(!userDoc){
        throw ApiError.BadRequest('User doesn\'t found');
    }

    const isActiveDeletingCity =  userDoc.bookmarks.find(bookmark => String(bookmark.city) === cityId );
  
    await UserModel.updateOne(
        { _id: idUser },
        { $pull: { 'bookmarks': { city: cityId } }}
    );

    const updatedUser = await UserModel.findById(idUser).populate('bookmarks.city');

    if(isActiveDeletingCity){
        
       if(updatedUser.bookmarks.length) { 
        updatedUser.bookmarks[0].isActive = true
       }
        await  updatedUser.save();
        const newUpdated = await UserModel.findById(idUser).populate('bookmarks.city');
        return newUpdated;
    }
    return updatedUser
}


export const  getAllUsers = async () => {
    const users = UserModel.find();
    return users;
}



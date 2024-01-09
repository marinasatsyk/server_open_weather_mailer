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
import TokenModel from "../models/token-model.js";


const SALTROUNDS = 10;
const {SERVER_HOST, SERVER_PORT, CLIENT_URL} = process.env;
const ACESS_TOKEN_KEY = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_KEY =  process.env.JWT_REFRESH_SECRET;


//CREATE
export const registration = async (req, email, password, firstName, lastName, role = 'user', isAdminCreate = false) => {
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

    //changed host and protocol
    await mailService.sendActivationMail(email, `${req.protocol}://${req.get('host')}/openweatherapp/activate/${activationLink}`)

    const userDto = new UserDto(userDoc); //id, email, isActivated

    //generate tokens
    const tokens = await tokenService.generateToken({...userDto});

    await tokenService.saveToken(userDto.id,  tokens.refreshToken)

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
    const userDoc = await UserModel.findOne({email}).populate('bookmarks.city');
    if(!userDoc){
        throw ApiError.BadRequest('User doesn\'t found')
    }
    const compare = await bcrypt.compare(password, userDoc.password);
    
    if(!compare){
        throw ApiError.BadRequest('Wrong username or password')
    }

    //verif if email is activated
    if(!userDoc.isActivated){
        throw ApiError.BadRequest('Email was not activated')
    }

    //update historical data when user connecting
    const citiesIdToUpdate = userDoc.bookmarks.filter((bookmark) => bookmark.isFollowHistory === true);

   await Promise.all(citiesIdToUpdate.map(async(bookmark)  => {
        await historyDataCreate(bookmark.city._id, bookmark.city.lat, bookmark.city.lon)
    }))

    const userFullDto = new UserFullDto(userDoc);
    const userDto = new UserDto(userDoc);
    const tokens = await tokenService.generateToken({...userDto});

    await tokenService.saveToken(userDto.id,  tokens.refreshToken)

    return{ ...tokens, user: userFullDto }
}


export const forgotPassword = async(req, email) => {
    const userDoc = await UserModel.findOne({email});
   
    if(!userDoc){
        throw ApiError.BadRequest('User doesn\'t found')
    }
    
    const payload = {
        userId : userDoc._id,
        email: userDoc.email
    }
    //Generate reset password token
    try{
        const passwordResetToken =  jwt.sign(payload, ACESS_TOKEN_KEY, {expiresIn: '10m'});

        userDoc.passwordResetToken = passwordResetToken;
        await userDoc.save({validateBeforeSave: false});

        //Send reset password link
        const mailService = new MailService();

   
       //change for prod
        await mailService.sendResetPasswordMail(
            email,
            //dev 
            // `${CLIENT_URL}/reset/password/${passwordResetToken}`
            //prod
            `${CLIENT_URL}/reset/password/${passwordResetToken}`
        )

   }catch(err){
        //handle errors
        userDoc.passwordResetToken = undefined;
        userDoc.save({validateBeforeSave: false});
        throw ApiError.BadRequest('There was an error sending password reset email. Please try again later.')
   }
};

export const resetPassword = async (req, passwordResetToken, password, confirmPassword) => {
   
    try{
       const passwordResetTokenVerify =  jwt.verify(passwordResetToken, ACESS_TOKEN_KEY);
       
   }catch(err){
     throw ApiError.BadRequest('Token is invalid');
   }

    const userDoc = await UserModel.findOne({passwordResetToken});
   
    if(!userDoc){
        throw ApiError.BadRequest('User doesn\'t found')
    }

    if(password !== confirmPassword){
        throw ApiError.BadRequest('Passwords are differents')
    }

     //crypt password 
     const hash = await bcrypt.hash(password, SALTROUNDS);

     userDoc.password = hash;
     userDoc.passwordResetToken = undefined;

    const updatedUser =  await userDoc.save();
};

//UPDATE
export const update = async(isAdmin, userId, emailToUpdate,  firstName, lastName, role, isActivated)=> {
   
    //find the user to update
    const userDoc = await UserModel.findById(userId);
    if(!userDoc){
      throw ApiError.BadRequest('User doesn\'t found')
    }

    //verification email exists if change email

    //if found user's email is different than the one in the request
    if(userDoc.email !== emailToUpdate){
        //check db if new email exists
        const candidate = await UserModel.findOne({ email: emailToUpdate})
        
        if(candidate){
            throw ApiError.BadRequest('email exists');  
        }
    }

    //only admin can update role&activation status
    const dataToUpdate = {};
    
    // Mettre à jour uniquement les champs présents dans la requête
    if (emailToUpdate) dataToUpdate.email = emailToUpdate;
    if (firstName) dataToUpdate.firstName = firstName;
    if (lastName) dataToUpdate.lastName = lastName;
    if (isAdmin) dataToUpdate.role = role;
    if (isAdmin) dataToUpdate.isActivated = isActivated;
    if(!isAdmin && userDoc.email !== emailToUpdate) dataToUpdate.isActivated =  false;
        
    if (Object.keys(dataToUpdate).length === 0) {
        return userDoc;
    }

   
    //if we change email and admin doesn't activate new email we send activation link adn user is not activated
    if(isAdmin && userDoc.email !== emailToUpdate && !isActivated || !isAdmin && userDoc.email !== emailToUpdate){
        
        const activationLink = uuidv4();       
        dataToUpdate.activationLink = activationLink;
        //send confirm mail+ activation link
        const mailService = new MailService();
        //for dev
         await mailService.sendActivationMail(emailToUpdate, `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/openweatherapp/activate/${activationLink}`)
        //for prod
        //await mailService.sendActivationMail(emailToUpdate, `${req.protocol}://${req.get('host')}/openweatherapp/activate/${activationLink}`)
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, dataToUpdate, { new: true });

    return updatedUser;
}


//DELETE
export const deleteUser = async (idUser) => {
    const userDoc = await UserModel.findById(idUser);
    
    if(!userDoc){
        throw ApiError.BadRequest('User doesn\'t found');
    }

    const deletedToken  = await TokenModel.findOneAndDelete({user: userDoc._id});
    const deletedUser = await  UserModel.findByIdAndDelete(idUser);
   
   return deletedUser
}





export const getUser = async (id) => {
    const userDoc = await UserModel.findById(id).populate('bookmarks.city');

    if(!userDoc){
      throw ApiError.BadRequest('User doesn\'t found')
    }

    const userDto = new UserFullDto(userDoc);

    return userDto;
}

export const refreshToken = async (refreshToken) => {
    
    if(!refreshToken){
        //user doesn't have the refresh token
        throw ApiError.UnauthorizedError(); 
    }

    const userData = await tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if(!userData || !tokenFromDb){
        //user doesn't have the token or is expired
        throw ApiError.UnauthorizedError(); 
    }

   
    //user's info can change, so we use the current info db
    const user = await UserModel.findById(userData.id) 

    const userDto = new UserDto(user);
    const userFullDto = new UserFullDto(user);

    const {accessToken} = await tokenService.reGenerateOneToken({...userDto})
    
    return{ accessToken, user: userFullDto }
}


//Bookmarks

//create
export const updateBookmarks = async (userDoc, city, isHistory, isActive) => {
    
    //history part
    const cityDoc = await CityServise.findOrCreateCity(city, isHistory);

    if(!cityDoc){
        throw ApiError.apply('Error of city creation')
    }

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
   
    if(!userDoc){
        throw ApiError.BadRequest('User doesn\'t found');
    }

    let isActiveDeletingCity = false;

    const deletingCityBm =  userDoc.bookmarks.find(bookmark => String(bookmark.city) === cityId );
   
    if(deletingCityBm.isActive){
        isActiveDeletingCity = true
    }

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



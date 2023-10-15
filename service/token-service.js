import jwt from 'jsonwebtoken';
import TokenModel from '../models/token-model.js';
const ACESS_TOKEN_KEY = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_KEY=  process.env.JWT_REFRESH_SECRET;


export const generateToken = async(payload) => {
    console.log("payload", payload)
    const accessToken = jwt.sign(payload, ACESS_TOKEN_KEY, {expiresIn: '15s'})
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_KEY, {expiresIn: '30d'})

    console.log('from generateToken',   accessToken,
    )
    console.log(
    '❤️❤️❤️refreshToken', refreshToken)
    return {
        accessToken,
        refreshToken
    }
}

export const validateAccessToken = async(token) => {

    try{
        console.log('from validate access token')
        const userData =  jwt.verify(token, ACESS_TOKEN_KEY);

        console.log('🎲🎲🎲validate Access Token', userData)
        return userData;
    }catch(err){
        return null;
    }
}
export const validateRefreshToken = async(refreshToken) => {

    try{
        const userData = jwt.verify(refreshToken, REFRESH_TOKEN_KEY)
        return userData;

    }catch(err){
        return null;
    }
}



//doesn't permit to loggin from differents mashines. we lost connexion . 

export const saveToken = async(userId, refreshToken) => {
    console.log('FROM SAVE TOKEN', userId, refreshToken)

    const tokenData = await TokenModel.findOne({user: userId})
    console.log('find one', tokenData)
    //if !first login
    if(tokenData){
        tokenData.refreshToken = refreshToken // we re-recorde refreshToken
        return tokenData.save();
    }
    //if first time loggin
    const token = await TokenModel.create({user: userId, refreshToken});
   console.log('token first One', token)
    return token;
}




export const removeToken = async(refreshToken) => {

    const tokenData = await TokenModel.deleteOne({refreshToken});

    return tokenData;
}

export const findToken = async(refreshToken) => {
    const tokenData = await TokenModel.findOne({refreshToken});
    return tokenData;
}
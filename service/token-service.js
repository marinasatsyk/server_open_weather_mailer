import jwt from 'jsonwebtoken';
import TokenModel from '../models/token-model.js';
const ACESS_TOKEN_KEY = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_KEY=  process.env.JWT_REFRESH_SECRET;


export const generateToken = async(payload) => {
    console.log("❗generate tokens")
    const accessToken = jwt.sign(payload, ACESS_TOKEN_KEY, {expiresIn: '10m'})
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_KEY, {expiresIn: '30d'})

    return {
        accessToken,
        refreshToken
    }
}

export const reGenerateOneToken = async(payload) => {
    console.log("❗regenerate tokens")
    const accessToken = jwt.sign(payload, ACESS_TOKEN_KEY, {expiresIn: '30s'});
    
    return {
        accessToken,
        refreshToken
    }
}



export const validateAccessToken = async(token) => {
    console.log("❗validate access token")
    try{
        const userData =  jwt.verify(token, ACESS_TOKEN_KEY);

        return userData;
    }catch(err){
        console.error(err);
        return null;
    }
}
export const validateRefreshToken = async(refreshToken) => {
    console.log("❗validate refresh token")
    try{
        const userData = jwt.verify(refreshToken, REFRESH_TOKEN_KEY)
        return userData;
    }catch(err){
        return null;
    }
}

//doesn't permit to loggin from differents mashines. we lost connexion. 
export const saveToken = async(userId, refreshToken) => {
    console.log("❗save token db")
    const tokenData = await TokenModel.findOne({user: userId})
    
    //if !first login
    if(tokenData){
        // we re-recorde refreshToken
        tokenData.refreshToken = refreshToken 
        return tokenData.save();
    }
    
    //if first time loggin
    const token = await TokenModel.create({user: userId, refreshToken});
    return token;
}


export const removeToken = async(refreshToken) => {

    const tokenData = await TokenModel.deleteOne({refreshToken});

    return tokenData;
}

export const findToken = async(refreshToken) => {
    console.log("❗find refreshToken token", refreshToken)
    const tokenData = await TokenModel.findOne({refreshToken});
    return tokenData;
}
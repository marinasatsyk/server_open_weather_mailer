import jwt from 'jsonwebtoken';
import TokenModel from '../models/token-model.js';
const ACESS_TOKEN_KEY = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_KEY=  process.env.JWT_REFRESH_SECRET;


export const generateToken = async(payload) => {
    console.log("payload", payload)
    const accessToken = jwt.sign(payload, ACESS_TOKEN_KEY, {expiresIn: '30m'})
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


export const generateRefreshToken = async(payload) => {

}
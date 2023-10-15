import UserModel from "../models/user-model.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import MailService from './mail-service.js';
import * as tokenService from './token-service.js';
import UserDto from '../dtos/user-dto.js';
const SALTROUNDS = 10;


export const registration = async (email, password, firstName, lastName, role = 'user') => {
    console.log(email, password, firstName, lastName, role);
   //verify user exists
    const candidate = await UserModel.findOne({email})
    if(candidate){
        throw new Error('email exists');
    }
   
    //crypt password 
    const hash = await bcrypt.hash(password, SALTROUNDS);
    //generate activation link
    const activationLink = uuidv4();
    console.log('hash', hash);
    
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
    console.log("userDoc", userDoc)
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

    return{ ...tokens, user: userDto }
}

const activate(activateLink)
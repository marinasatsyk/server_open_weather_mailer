import { ApiError } from "../exceptions/api-error.js";
import * as tokenService from '../service/token-service.js';

export const authMiddleware = async(req, res, next) => {
    try{
        const authorizationHeader = req.headers.authorization;
        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authorizationHeader.split(' ')[1]; 
        if(!accessToken){
            return next(ApiError.UnauthorizedError())
        }

        const userData = await  tokenService.validateAccessToken(accessToken);

        if(!userData ){
            return next(ApiError.UnauthorizedError())
        }
        req.user = userData;
        next();

    }catch(err){
        return next(ApiError.UnauthorizedError())
    }
}


export const authAdminMiddleware = async(req, res, next) => {
    try{
        const authorizationHeader = req.headers.authorization;
        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authorizationHeader.split(' ')[1]; //for delete word Bearer
        if(!accessToken){
            return next(ApiError.UnauthorizedError())
        }

        const userData = await  tokenService.validateAccessToken(accessToken);

        if(!userData ){
            return next(ApiError.UnauthorizedError())
        }

        if(userData.role !== 'root'){
            return next(ApiError.UnauthorizedError())
        }
        req.user = userData;
        next();

    }catch(err){
        return next(ApiError.UnauthorizedError())
    }
}


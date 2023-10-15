import { ApiError } from "../exceptions/api-error.js";
import * as tokenService from '../service/token-service.js';

const authMiddleware = async(req, res, next) => {
    try{
        const authorizationHeader = req.headers.authorization;
        console.log(authorizationHeader)
        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authorizationHeader.split(' ')[1]; //for delete word Bearer
        if(!accessToken){
            return next(ApiError.UnauthorizedError())
        }
        console.log(accessToken)

        const userData = await  tokenService.validateAccessToken(accessToken);

        console.log(userData)

        if(!userData ){
            return next(ApiError.UnauthorizedError())
        }

        req.user = userData;
        next();

    }catch(err){
        return next(ApiError.UnauthorizedError())
    }
}

export default authMiddleware;
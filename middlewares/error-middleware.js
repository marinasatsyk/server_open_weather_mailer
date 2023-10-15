import { ApiError } from "../exceptions/api-error.js";

export const errorMiddleware = (err, req, res, next) => {
        console.log('from middleware error', err);
    if(err instanceof ApiError){
        return res.status(err.status).json({
            message: err.message, 
            errors: err.errors
        })
    }

    return res.status(500).json({message: 'Internal Server Error'})
}